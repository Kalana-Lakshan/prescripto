"use server";

import { db } from "@/db";
import { pharmacies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function registerPharmacy(formData: FormData) {
  const name = formData.get("name") as string;
  const licenseNumber = formData.get("licenseNumber") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  try {
    // Check if license already exists
    const existing = await db.select().from(pharmacies).where(eq(pharmacies.licenseNumber, licenseNumber));
    
    if (existing.length > 0) {
      return { success: false, error: "License Number already registered." };
    }

    // Create Account
    await db.insert(pharmacies).values({
      name,
      licenseNumber,
      address,
      phone,
      password, // In a real app, hash this!
    });

    return { success: true };

  } catch (error) {
    console.error("Pharmacy Reg Error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}