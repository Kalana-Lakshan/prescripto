"use server";

import { db } from "@/db";
import { notifications, doctors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function notifyPatientAccess(patientNic: string, doctorSlmc: string) {
  try {
    // 1. Get Doctor Name
    const doctor = await db.select()
      .from(doctors)
      .where(eq(doctors.slmcNumber, doctorSlmc))
      .limit(1);

    const docName = doctor[0]?.name || "A Doctor";

    // 2. Create Notification Message
    const message = `EMERGENCY ACCESS: ${docName} accessed your medical profile via Walk-in mode.`;

    // 3. Save to DB
    await db.insert(notifications).values({
      patientId: patientNic,
      message: message,
      type: "alert", // Mark as alert so it stands out
    });

    return { success: true };
  } catch (error) {
    console.error("Notification Error:", error);
    return { success: false };
  }
}