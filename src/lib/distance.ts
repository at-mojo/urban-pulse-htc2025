export interface Coordinate {
  id: string;
  lat: number;
  lon: number;
}

export interface DistanceCluster {
  center: Coordinate;
  members: Coordinate[];
}

const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function metersBetween(a: Coordinate, b: Coordinate): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Clusters points by distance using connectivity (transitive closure).
// The cluster center is the simple centroid of member coordinates.
export function clusterReportsByDistance(
  reports: Coordinate[],
  thresholdMeters = 100
): DistanceCluster[] {
  const n = reports.length;
  if (n === 0) return [];

  // Build adjacency list where edges connect points within threshold
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (metersBetween(reports[i], reports[j]) <= thresholdMeters) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  // Connected components via DFS
  const visited = new Array<boolean>(n).fill(false);
  const clusters: DistanceCluster[] = [];

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const stack = [i];
    visited[i] = true;
    const compIdxs: number[] = [];

    while (stack.length) {
      const u = stack.pop()!;
      compIdxs.push(u);
      for (const v of adj[u]) {
        if (!visited[v]) {
          visited[v] = true;
          stack.push(v);
        }
      }
    }

    const members = compIdxs.map((idx) => reports[idx]);
    const { latSum, lonSum } = members.reduce(
      (acc, p) => ({ latSum: acc.latSum + p.lat, lonSum: acc.lonSum + p.lon }),
      { latSum: 0, lonSum: 0 }
    );
    const center = {
      id: members[0].id, // retain a member id to satisfy Coordinate type
      lat: latSum / members.length,
      lon: lonSum / members.length,
    } satisfies Coordinate;

    clusters.push({ center, members });
  }

  return clusters;
}
