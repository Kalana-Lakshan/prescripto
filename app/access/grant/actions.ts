"use server";

import { db } from "@/db";
// 1. UPDATED IMPORT: Added 'doctors'
import { patients, accessRequests, doctors } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache"; 

// 1. Create Access Request (Join Queue)
export async function createAccessRequest(formData: FormData, doctorId: string) {
  const nic = formData.get("nic") as string;

  try {
    // A. Verify Patient Exists
    const patientList = await db.select().from(patients).where(eq(patients.nic, nic));
    const patient = patientList[0];

    if (!patient) {
      return { success: false, error: "Patient NIC not found. Please register first." };
    }

    // B. Add to Queue
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

// 2. Check Request Status (Polling)
export async function checkRequestStatus(nic: string, doctorId: string) {
  noStore(); // Crucial: Never cache this response

  try {
    const requests = await db.select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.patientId, nic),
          eq(accessRequests.doctorId, doctorId)
        )
      )
      .orderBy(desc(accessRequests.createdAt))
      .limit(1);

    if (requests.length === 0) return null;
    
    // Returns "pending", "active", or "completed"
    return { status: requests[0].status }; 

  } catch (error) {
    return null;
  }
}

// 3. NEW: Get Doctor Name by SLMC ID
export async function getDoctorName(slmc: string) {
  noStore();
  try {
    const result = await db.select({ name: doctors.name })
      .from(doctors)
      .where(eq(doctors.slmcNumber, slmc))
      .limit(1);
      
    // Return name if found, otherwise null
    return result[0]?.name || null;
  } catch (e) {
    console.error("Error fetching doctor name:", e);
    return null;
  }
}