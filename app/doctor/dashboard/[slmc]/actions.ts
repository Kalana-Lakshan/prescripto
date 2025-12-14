"use server";

import { db } from "@/db";
import { accessRequests, doctors } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache"; 

export async function getQueue(slmc: string) {
  noStore(); // Forces fresh data
  
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

// 3. UPDATED: Fetch ALL Doctor Details
export async function getDoctorProfile(slmc: string) {
  noStore(); // Force fresh data here too
  
  try {
    // CHANGE: Removed { name: doctors.name } to select ALL columns
    const doctor = await db.select()
      .from(doctors)
      .where(eq(doctors.slmcNumber, slmc))
      .limit(1);
    
    // Debug Log: Use this to verify data in your terminal
    console.log("Fetched Doctor Profile:", doctor[0]); 

    return doctor[0] || null;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return null;
  }
}