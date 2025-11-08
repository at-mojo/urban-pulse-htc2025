import { stackServerApp } from "@/stack/server";

// Get User
export async function getUser(data: { user_id: string }) {
  try {
    const user = await stackServerApp.getUser(data.user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve user");
  }
}

// Update User

// Delete User
