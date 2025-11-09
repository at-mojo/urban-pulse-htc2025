import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { Ollama } from 'ollama';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return R * c;
}

function parseArgs() {
  const threshold = Number(process.argv[2] || '100');
  const minScore = Number(process.argv[3] || '0.7');
  return { threshold, minScore };
}

function safeParseScore(text) {
  if (typeof text !== 'string') return null;
  const match = text.match(/\d*\.?\d+/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return isNaN(n) ? null : n;
}

async function comparePair(ollama, a, b) {
  const prompt = `Compare the two following titles and descriptions of an urban issue. On a scale from 0 to 1, where 0 means not the same issue and 1 means the same issue,\nscore on how confident you are that these two descriptions are of the same issue. The title should be weighted much less as it is prone to human error. \nAssume the location is the same area. Limit your response to a single decimal number. Do not provide any reasoning or explanation, just the number.\n\nTitle 1: ${a.title}\nDescription 1: ${a.desc}\n\nTitle 2: ${b.title}\nDescription 2: ${b.desc}`;

  const res = await ollama.chat({
    model: process.env.OLLAMA_MODEL || 'llama3.2-vision',
    messages: [{ role: 'user', content: prompt }],
  });
  return safeParseScore(res?.message?.content);
}

async function main() {
  const { threshold, minScore } = parseArgs();
  const points = await prisma.report.findMany({ select: { id: true, lat: true, lon: true } });
  console.log(`Total reports: ${points.length}`);
  if (points.length < 2) return;

  // Build adjacency by distance
  const n = points.length;
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineMeters(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      if (d <= threshold) { adj[i].push(j); adj[j].push(i); }
    }
  }

  // Connected components (size >= 2)
  const visited = new Array(n).fill(false);
  const clusters = [];
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const stack = [i];
    visited[i] = true;
    const comp = [];
    while (stack.length) {
      const u = stack.pop();
      comp.push(u);
      for (const v of adj[u]) if (!visited[v]) { visited[v] = true; stack.push(v); }
    }
    if (comp.length >= 2) clusters.push(comp);
  }

  console.log(`Nearby clusters within ${threshold}m: ${clusters.length}`);
  if (!clusters.length) return;

  const host = process.env.OLLAMA_HOST;
  if (!host) {
    console.warn('OLLAMA_HOST not set. Listing pairs that would be compared (dry run).');
  }
  const ollama = host ? new Ollama({ host }) : null;

  for (let idx = 0; idx < clusters.length; idx++) {
    const comp = clusters[idx];
    const ids = comp.map(i => points[i].id);
    const rows = await prisma.report.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, desc: true },
    });
    const byId = new Map(rows.map(r => [r.id, r]));

    console.log(`\nCluster ${idx + 1} (size=${comp.length})`);
    for (let i = 0; i < comp.length; i++) {
      for (let j = i + 1; j < comp.length; j++) {
        const a = byId.get(points[comp[i]].id);
        const b = byId.get(points[comp[j]].id);
        if (!a || !b) continue;
        if (!ollama) {
          console.log(`  Pair (dry): ${a.id} vs ${b.id}`);
          continue;
        }
        try {
          const score = await comparePair(ollama, a, b);
          if (score == null) {
            console.log(`  Pair: ${a.id} vs ${b.id} -> could not parse score`);
          } else {
            const flag = score >= minScore ? 'MATCH' : '----';
            console.log(`  Pair: ${a.id} vs ${b.id} -> score=${score.toFixed(2)} ${flag}`);
          }
        } catch (e) {
          console.log(`  Pair: ${a.id} vs ${b.id} -> error: ${e?.message || e}`);
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

