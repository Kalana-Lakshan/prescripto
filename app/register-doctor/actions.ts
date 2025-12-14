"use server";

import { db } from "@/db";
import { doctors } from "@/db/schema";
// Remove "redirect" import

export async function registerDoctor(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const slmcNumber = formData.get("slmcNumber") as string;
  const specialization = formData.get("specialization") as string;
  const password = formData.get("password") as string;

  try {
    await db.insert(doctors).values({
      name,
      email,
      slmcNumber,
      specialization,
      password,
    });

    // RETURN DATA INSTEAD OF REDIRECTING
    return { success: true, slmcNumber };

  } catch (error) {
    console.error("Doctor Registration Failed:", error);
    return { success: false, error: "Email or SLMC Number already exists" };
  }
}