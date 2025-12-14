"use server";

import { db } from "@/db";
import { pharmacies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPharmacyProfile(license: string) {
  try {
    const result = await db.select()
      .from(pharmacies)
      .where(eq(pharmacies.licenseNumber, license))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    return null;
  }
}