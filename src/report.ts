import prisma from "./prisma";
import { createId } from "@paralleldrive/cuid2";

// Create Report
export async function createReport(data: {
  userId: string;
  title: string;
  desc?: string,
  lat: string,
  lon: string,
  path: string,
  urgency: string,
}) {
  // Check inputs
  if (!data.userId) {
    return new Response("User ID is required", { status: 400 });
  }

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
        userId: data.userId,
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
// export async function getPaginatedReports(page: number, pageSize: number) {