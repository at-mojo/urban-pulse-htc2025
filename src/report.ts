import prisma from "./prisma";
import { createId } from "@paralleldrive/cuid2";
import { stackServerApp } from "@/stack/server";

function isLoggedIn(): boolean {
  return !!stackServerApp.getUser;
}

// Create Report
export async function createReport(data: {
  title: string,
  desc?: string,
  lat: string,
  lon: string,
  path: string,
  urgency: string,
}) {
  if (!isLoggedIn()) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check inputs
  if (!data.title) {
    return new Response("Title is required", { status: 400 });
  }

  if (data.title.length > 128) {
    return new Response("Title must be less than 128 characters", { status: 400 });
  }

  if (!data.lat || !data.lon) {
    return new Response("Location is required", { status: 400 });
  }

  if (!data.path) {
    return new Response("Image path is required", { status: 400 });
  }

  if (!data.urgency || (data.urgency !== "LOW" && data.urgency !== "MEDIUM" && data.urgency !== "HIGH")) {
    return new Response("Invalid urgency level", { status: 400 });
  }

  try {
    await prisma.report.create({
      data: {
        id: createId(),
        userId: (await stackServerApp.getUser())!.id,
        title: data.title,
        desc: data.desc || "",
        lat: data.lat,
        lon: data.lon,
        path: data.path,
        urgency: data.urgency,
      }
    })

    return new Response("Report created successfully", { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Get All Reports
export async function getAllReports() {
  // if (!isLoggedIn()) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    })

    return new Response(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Get paginated Reports
export async function getPaginatedReports(data: { page: number; pageSize: number }) {
  if (!isLoggedIn()) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      skip: (data.page - 1) * data.pageSize,
      take: data.pageSize,
      orderBy: {
        createdAt: 'desc',
      }
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
      where: { id: data.id}
    })
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
        createdAt: 'desc',
      }
    })

    return new Response(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

