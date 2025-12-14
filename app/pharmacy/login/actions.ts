"use server";

import { db } from "@/db";
import { pharmacies } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function loginPharmacy(formData: FormData) {
  const licenseNumber = formData.get("licenseNumber") as string;
  const password = formData.get("password") as string;

  try {
    const result = await db.select()
      .from(pharmacies)
      .where(
        and(
          eq(pharmacies.licenseNumber, licenseNumber),
          eq(pharmacies.password, password)
        )
      )
      .limit(1);

    if (result.length > 0) {
      return { success: true, license: result[0].licenseNumber };
    } else {
      return { success: false, error: "Invalid License Number or Password" };
    }
  } catch (error) {
    console.error("Pharmacy Login Error:", error);
    return { success: false, error: "System Error" };
  }
}