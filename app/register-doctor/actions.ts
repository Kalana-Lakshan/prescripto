"use server";

import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function registerDoctor(formData: FormData) {
  // Extracting data from the form
  const name = formData.get("name") as string;
  const slmc = formData.get("slmc") as string;
  const specialization = formData.get("specialization") as string;
  
  // Explicitly getting Hospital Name and Doctor's Email
  const hospital = formData.get("hospital") as string; 
  const email = formData.get("email") as string;
  
  const password = formData.get("password") as string;

  try {
    // 1. Check if SLMC already exists (prevent duplicates)
    const existingSlmc = await db.select().from(doctors).where(eq(doctors.slmcNumber, slmc));
    if (existingSlmc.length > 0) return { success: false, error: "SLMC Number already registered." };

    // 2. Check if Email already exists
    const existingEmail = await db.select().from(doctors).where(eq(doctors.email, email));
    if (existingEmail.length > 0) return { success: false, error: "Email address already in use." };

    // 3. Create the Doctor Account
    await db.insert(doctors).values({
      name,
      slmcNumber: slmc,
      specialization,
      hospital, // Saving the Hospital Name
      email,    // Saving the Doctor's Email
      password, // In a real app, remember to hash this!
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}