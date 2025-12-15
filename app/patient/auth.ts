"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

// 1. LOGIN ACTION
export async function loginPatient(formData: FormData) {
  const nic = formData.get("nic") as string;
  const password = formData.get("password") as string;

  try {
    // A. Find Patient
    const result = await db.select().from(patients).where(eq(patients.nic, nic)).limit(1);
    const patient = result[0];

    // B. Verify Password
    if (!patient || patient.password !== password) {
      return { success: false, error: "Invalid NIC or Password" };
    }

    // C. Set Secure Session Cookie (UPDATED: Added 'await')
    (await cookies()).set("patient_session", patient.nic, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 Week
      path: "/",
    });

    return { success: true, patient: { name: patient.name, nic: patient.nic } };

  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Login failed" };
  }
}

// 2. CHECK SESSION ACTION
export async function getPatientSession() {
  // UPDATED: Added 'await'
  const cookieStore = await cookies();
  const session = cookieStore.get("patient_session");
  
  if (!session) return null;

  // Validate the cookie value against DB
  const result = await db.select({ name: patients.name, nic: patients.nic })
    .from(patients)
    .where(eq(patients.nic, session.value))
    .limit(1);

  return result[0] || null;
}

// 3. LOGOUT ACTION
export async function logoutPatient() {
  // UPDATED: Added 'await'
  (await cookies()).delete("patient_session");
  return { success: true };
}