"use server";

import { db } from "@/db";
import { patients, accessRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createAccessRequest(formData: FormData, doctorId: string) {
  const nic = formData.get("nic") as string;

  console.log(`Processing request: Patient ${nic} -> Doctor ${doctorId}`);

  try {
    // 1. Verify Patient Exists
    // Note: We use db.select() to be safe, just like before
    const patientList = await db.select().from(patients).where(eq(patients.nic, nic));
    const patient = patientList[0];

    if (!patient) {
      return { success: false, error: "Patient NIC not found. Please register first." };
    }

    // 2. Add to Queue
    await db.insert(accessRequests).values({
      doctorId: doctorId,
      patientId: nic,
      patientName: patient.name,
      status: "pending"
    });

    return { success: true };

  } catch (e) {
    console.error("Queue Error:", e);
    return { success: false, error: "System Error: Could not join queue." };
  }
}