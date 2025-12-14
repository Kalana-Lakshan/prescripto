"use server";

import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function loginDoctor(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Check credentials
    const result = await db.select()
      .from(doctors)
      .where(
        and(
          eq(doctors.email, email),
          eq(doctors.password, password)
        )
      )
      .limit(1);

    if (result.length > 0) {
      // Login Success! Return the SLMC number for the redirect
      return { success: true, slmc: result[0].slmcNumber };
    } else {
      return { success: false, error: "Invalid Email or Password" };
    }

  } catch (error) {
    console.error("Doctor Login Error:", error);
    return { success: false, error: "System Error. Please try again." };
  }
}