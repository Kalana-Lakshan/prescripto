"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function loginPatient(formData: FormData) {
  const nic = formData.get("nic") as string;
  const password = formData.get("password") as string;

  try {
    // Check if patient exists with matching password
    const result = await db.select()
      .from(patients)
      .where(
        and(
          eq(patients.nic, nic),
          eq(patients.password, password)
        )
      )
      .limit(1);

    if (result.length > 0) {
      return { success: true, nic: result[0].nic };
    } else {
      return { success: false, error: "Invalid NIC or Password" };
    }
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "System Error" };
  }
}