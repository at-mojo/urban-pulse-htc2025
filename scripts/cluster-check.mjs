import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

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

async function main() {
  const threshold = Number(process.argv[2] || '100');
  const points = await prisma.report.findMany({ select: { id: true, lat: true, lon: true } });

  const n = points.length;
  console.log(`Total reports: ${n}`);
  if (n === 0) return;

  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineMeters(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      if (d <= threshold) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

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
      for (const v of adj[u]) {
        if (!visited[v]) {
          visited[v] = true;
          stack.push(v);
        }
      }
    }
    if (comp.length >= 2) clusters.push(comp);
  }

  console.log(`Clusters (>=2 members) within ${threshold}m: ${clusters.length}`);
  clusters.slice(0, 10).forEach((c, idx) => {
    const ids = c.map(i => points[i].id);
    console.log(`  Cluster ${idx + 1}: size=${c.length}, ids=${ids.join(', ')}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

