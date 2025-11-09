"use server";

import prisma from "./prisma";
import { createId } from "@paralleldrive/cuid2";
import { stackServerApp } from "@/stack/server";
import { NextResponse } from "next/server";

function isLoggedIn(): boolean {
  return !!stackServerApp.getUser;
}

// Create Report
export async function createReport(data: {
  title: string;
  desc?: string;
  lat: number;
  lon: number;
  path: string;
  urgency: string;
}) {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return JSON.parse(JSON.stringify(reports));
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get paginated Reports
export async function getPaginatedReports(data: {
  page: number;
  pageSize: number;
}) {
  if (!isLoggedIn()) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      skip: (data.page - 1) * data.pageSize,
      take: data.pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Get one report
export async function getReport(data: { id: string }) {
  if (!isLoggedIn()) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!data.id) {
    return new Response("Report ID is required", { status: 400 });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: data.id },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Get user's reports
// Can be used to get own reports or another user's reports, only works when logged in
export async function getUserReports(data: { userId: string }) {
  if (!isLoggedIn()) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!data.userId) {
    return new Response("User ID is required", { status: 400 });
  }

  try {
    const reports = await prisma.report.findMany({
      where: { userId: data.userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function getVote(reportId: string, userId: string) {
  try {
    const vote = await prisma.vote.findFirst({
      where: {
        reportId: reportId,
        userId: userId
      }
    });

    return vote;
  } catch (error) {
    throw new Error("Error fetching vote");
  }
}

// Number should be either 1 (upvote) or -1 (downvote) or 0 (remove vote)
// Will return new vote count.
export async function updateVote(data: { reportId: string, value: number }) {
  if (!isLoggedIn()) {
    throw new Error("Unauthorized");
  }

  if (data.value !== 1 && data.value !== -1 && data.value !== 0) {
    throw new Error("Invalid vote value");
  }

  const userId = (await stackServerApp.getUser())!.id;

  try {
    const vote = await getVote(data.reportId, userId);

    // check if vote exists
    if (vote) {
      // if it does, modify upvote to "upvote"
      await prisma.vote.update({
        where: {
          userId_reportId: {
            userId: userId,
            reportId: data.reportId
          }
        },
        data: {
          voteValue: data.value
        }
      });
    } else {
      prisma.vote.create({
        data: {
          userId: userId,
          reportId: data.reportId,
          voteValue: 1
        }
      });
    }

    const votes = await prisma.vote.findMany({
      select: {
        voteValue: true
      },
      where: {
        reportId: data.reportId,
      }
    })

    const voteCount = votes.reduce ((sum, vote) => sum + vote.voteValue, 0);

    // Now, update report's vote counts
    const report = await prisma.report.update({
      where: { id: data.reportId },
      data: {
        rating: voteCount
      }
    })

    return new Response(report.rating.toString(), { status: 200 });
  } catch (error) {
    console.error("Error upvoting report:", error);
    throw new Error("Internal Server Error");
  }
}
