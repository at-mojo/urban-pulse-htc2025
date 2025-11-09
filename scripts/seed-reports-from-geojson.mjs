import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
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

function usageAndExit() {
  console.error('Usage: node scripts/seed-reports-from-geojson.mjs <path-to-geojson> [userId]');
  process.exit(1);
}

async function main() {
  const geoPath = process.argv[2];
  const userIdArg = process.argv[3];
  if (!geoPath) usageAndExit();

  const filePath = path.resolve(process.cwd(), geoPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  /** @type {any} */
  const data = JSON.parse(raw);

  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    console.error('Input must be a GeoJSON FeatureCollection.');
    process.exit(1);
  }

  const fallbackUserId = '11111111-1111-1111-1111-111111111111';
  const userId = userIdArg || process.env.SEED_USER_ID || fallbackUserId;

  let created = 0;
  for (const feature of data.features) {
    if (!feature || feature.type !== 'Feature') continue;
    if (!feature.geometry || feature.geometry.type !== 'Point') continue;
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const [lon, lat] = coords;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;

    const title = feature.properties?.name || feature.properties?.full_address || 'Seeded Report';
    const desc = feature.properties?.feature_type ? `Seeded from GeoJSON (${feature.properties.feature_type})` : 'Seeded from GeoJSON';
    const urgency = 'LOW';

    await prisma.report.create({
      data: {
        userId,
        title: String(title).slice(0, 128),
        desc: String(desc),
        lat,
        lon,
        path: null,
        urgency,
      },
    });

    created++;
  }

  console.log(`Seeded ${created} report(s) from ${path.basename(filePath)}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

