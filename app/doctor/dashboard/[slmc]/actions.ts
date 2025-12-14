"use server";

import { db } from "@/db";
import { accessRequests } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache"; // <--- IMPORT THIS
import { doctors } from "@/db/schema";

export async function getQueue(slmc: string) {
  noStore(); // <--- ADD THIS LINE (Forces fresh data)
  
  console.log(`Checking queue for doctor: ${slmc}`); // Debug Log
  try {
    const queue = await db.select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.doctorId, slmc),
          eq(accessRequests.status, "pending")
        )
      )
      .orderBy(desc(accessRequests.createdAt));
    
    return queue;
  } catch (error) {
    console.error("Error fetching queue:", error);
    return [];
  }
}

export async function acceptPatient(reqId: number) {
  try {
    await db.update(accessRequests)
      .set({ status: "active" })
      .where(eq(accessRequests.id, reqId));
    
    return { success: true };
  } catch (error) {
    console.error("Error accepting patient:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// 3. NEW: Fetch Doctor Name by SLMC
export async function getDoctorProfile(slmc: string) {
  try {
    const doctor = await db.select({ name: doctors.name })
      .from(doctors)
      .where(eq(doctors.slmcNumber, slmc))
      .limit(1);
    
    return doctor[0] || null;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return null;
  }
}