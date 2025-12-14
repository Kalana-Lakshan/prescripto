"use server";

import { db } from "@/db";
import { patients, prescriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPatientDashboardData(nic: string) {
  try {
    // 1. Get Personal Info
    const patientData = await db.select()
      .from(patients)
      .where(eq(patients.nic, nic))
      .limit(1);

    if (patientData.length === 0) return null;

    // 2. Get Past Prescriptions
    const history = await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, nic))
      .orderBy(desc(prescriptions.createdAt));

    return {
      profile: patientData[0],
      history: history
    };
  } catch (error) {
    console.error("Error fetching patient dashboard:", error);
    return null;
  }
}