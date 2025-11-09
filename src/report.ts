"use server";

import prisma from "./prisma";
import { createId } from "@paralleldrive/cuid2";
import { stackServerApp } from "@/stack/server";
import type { Report, Urgency } from "@prisma/client";

function isLoggedIn(): boolean {
  return !!stackServerApp.getUser;
}

// Haversine distance in meters between two coordinates
function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return R * c;
}

// Create Report
export async function createReport(data: {
  title: string;
  desc?: string;
  lat: number;
  lon: number;
  path: string;
  urgency: string;
}): Promise<{ message: string }> {
  // Check inputs
  if (!data.title) {
    throw new Error("Title is required");
  }

  if (data.title.length > 128) {
    throw new Error("Title must be less than 128 characters");
  }

  if (!data.lat || !data.lon) {
    throw new Error("Location is required");
  }

  if (
    !data.urgency ||
    (data.urgency !== "LOW" &&
      data.urgency !== "MEDIUM" &&
      data.urgency !== "HIGH")
  ) {
    throw new Error("Invalid urgency level");
  }

  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    await prisma.report.create({
      data: {
        id: createId(),
        userId: user ? user.id : "",
        title: data.title,
        desc: data.desc || "",
        lat: data.lat,
        lon: data.lon,
        path: data.path,
        urgency: data.urgency,
      },
    });

    return { message: "Report created successfully" };
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Internal Server Error");
  }
}

// Get All Reports
export async function getAllReports() {
  if (!isLoggedIn() || !stackServerApp.getUser) {
    throw new Error("Unauthorized");
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    });

    return { content: reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Internal Server Error");
  }
}

// Get paginated Reports
export async function getPaginatedReports(data: {
  page: number;
  pageSize: number;
}): Promise<{ content: Report[] }> {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

  try {
    const reports = await prisma.report.findMany({
      skip: (data.page - 1) * data.pageSize,
      take: data.pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    return { content: reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Internal Server Error");
  }
}

// Get one report
export async function getReport(data: {
  id: string;
}): Promise<{ content: Report }> {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

  if (!data.id) {
    throw new Error("Report ID is required");
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: data.id },
    });
    if (!report) {
      throw new Error("Report not found");
    }

    return { content: report };
  } catch (error) {
    console.error("Error fetching report:", error);
    throw new Error("Internal Server Error");
  }
}

export async function updateReport(data: {
  reportId: string,
  title: string,
  desc: string,
  lat: number,
  lon: number,
  path: string,
  urgency: Urgency
}): Promise<{ content: Report }> {
  if (!data.reportId || !data.title || !data.urgency) {
    throw new Error("Missing fields");
  }

  try {
    // make sure user owns the report
    const user = await stackServerApp.getUser()
    if (!user) {
      throw new Error("Unauthorized");
    }

    const report = await prisma.report.update({
      where: {
        id: data.reportId,
        userId: user.id,
      },
      data: {
        title: data.title,
        desc: data.desc,
        lat: data.lat,
        lon: data.lon,
        path: data.path,
        urgency: data.urgency,
      },
    })

    if(!report) {
      throw new Error("Report not found or you do not have permission to update it");
    }

    return { content: report };
  } catch (error) {    
    console.error("Error updating report:", error);
    throw new Error("Internal Server Error");
  }
};

// Be able to delete own report
export async function deleteReport(data: {
  id: string;
}): Promise<{ content: string }> {
  if (!data.id) {
    throw new Error("Report ID is required");
  }

  try {
    // make sure user owns the report
    const user = await stackServerApp.getUser()
    if (!user) {
      throw new Error("Unauthorized");
    }
    const report = await prisma.report.findUnique({
      where: {
        id: data.id,
        userId: user.id,
      },
    });

    if (!report) {
      throw new Error(
        "Report not found or you do not have permission to delete it"
      );
    }

    await prisma.report.delete({
      where: {
        id: data.id,
      },
    });
    return { content: "Report deleted successfully" };
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new Error("Internal Server Error");
  }
}

// Get user's reports
// Can be used to get own reports or another user's reports, only works when logged in
export async function getUserReports(data: {
  userId: string;
}): Promise<{ content: Report[] }> {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

  if (!data.userId) {
    throw new Error("User ID is required");
  }

  try {
    const reports = await prisma.report.findMany({
      where: { userId: data.userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { content: reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Internal Server Error");
  }
}

async function getVote(reportId: string, userId: string) {
  try {
    const vote = await prisma.vote.findFirst({
      where: {
        reportId: reportId,
        userId: userId,
      },
    });

    return vote;
  } catch (_) {
    throw new Error("Error fetching vote");
  }
}

// Number should be a value from 0 to 5 stars
export async function updateVote(data: {
  reportId: string;
  value: number;
}): Promise<{ content: number }> {
  if (data.value < 0 || data.value > 5) {
    throw new Error("Invalid vote value");
  }

  const user = await stackServerApp.getUser()
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const vote = await getVote(data.reportId, user.id);

    // check if vote exists
    if (vote) {
      // if it does, modify upvote to "upvote"
      await prisma.vote.update({
        where: {
          userId_reportId: {
            userId: user.id,
            reportId: data.reportId,
          },
        },
        data: {
          voteValue: data.value,
        },
      });
    } else {
      await prisma.vote.create({
        data: {
          userId: user.id,
          reportId: data.reportId,
          voteValue: data.value,
        },
      });
    }

    const votes = await prisma.vote.findMany({
      select: {
        voteValue: true,
      },
      where: {
        reportId: data.reportId,
      },
    });

    if (votes.length === 0) {
      return { content: 0 };
    }

    const rating = (votes.reduce((sum, vote) => sum + vote.voteValue, 0)) / votes.length;

    // Now, update report's vote counts
    await prisma.report.update({
      where: { id: data.reportId },
      data: {
        rating: rating,
      },
    });

    return { content: rating };

  } catch (error) {
    console.error("Error upvoting report:", error);
    throw new Error("Internal Server Error");
  }
}

// Fetch only id/lat/lon for all reports (backend-only helper)
export async function getReportCoordinates(): Promise<
  { id: string; lat: number; lon: number }[]
> {
  if (!isLoggedIn() || !stackServerApp.getUser) {
    throw new Error("Unauthorized");
  }

  const user = await stackServerApp.getUser?.();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const coords = await prisma.report.findMany({
    select: { id: true, lat: true, lon: true },
  });
  return coords;
}

// Group reports where any pair in a group is within thresholdMeters
// Uses a connectivity (union-find/DFS) approach to capture transitive closeness
export async function getNearbyReportClusters(
  thresholdMeters = 100,
  minGroupSize = 2
): Promise<
  {
    center: { lat: number; lon: number };
    members: { id: string; lat: number; lon: number }[];
  }[]
> {
  if (!isLoggedIn() || !stackServerApp.getUser) {
    throw new Error("Unauthorized");
  }

  const user = await stackServerApp.getUser?.();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const points = await prisma.report.findMany({
    select: { id: true, lat: true, lon: true },
  });

  const n = points.length;
  if (n === 0) return [];

  // Build adjacency list for edges within threshold
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineMeters(
        points[i].lat,
        points[i].lon,
        points[j].lat,
        points[j].lon
      );
      if (d <= thresholdMeters) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  // Find connected components via DFS YIPPEEEEEEEEEEEEEEEEEEEEEE imma do it to him MUAHAHAHAHAAHAHy
  const visited = new Array<boolean>(n).fill(false);
  const clusters: {
    center: { lat: number; lon: number };
    members: { id: string; lat: number; lon: number }[];
  }[] = [];

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const stack = [i];
    const componentIdxs: number[] = [];
    visited[i] = true;

    while (stack.length) {
      const u = stack.pop();
      if (!u) {
        continue;
      }
      componentIdxs.push(u);
      for (const v of adj[u]) {
        if (!visited[v]) {
          visited[v] = true;
          stack.push(v);
        }
      }
    }

    if (componentIdxs.length >= minGroupSize) {
      const members = componentIdxs.map((idx) => points[idx]);
      // Compute simple centroid for the group
      const { latSum, lonSum } = members.reduce(
        (acc, p) => ({
          latSum: acc.latSum + p.lat,
          lonSum: acc.lonSum + p.lon,
        }),
        { latSum: 0, lonSum: 0 }
      );
      const center = {
        lat: latSum / members.length,
        lon: lonSum / members.length,
      };
      clusters.push({ center, members });
    }
  }

  return clusters;
}

export async function getReportRating(data: {
  id: string;
}): Promise<{ content: number }> {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

  try {
    const res = await prisma.report.findFirst({
      where: { id: data.id },
    });

    if (!res) {
      return { content: 0 };
    }

    return { content: res.rating };
  } catch (error) {
    console.error("Error counting user reports:", error);
    throw new Error("Internal Server Error");
  }
}
