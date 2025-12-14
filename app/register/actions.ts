"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { redirect } from "next/navigation";

export async function registerPatient(formData: FormData) {
  // 1. Get data from the form
  const nic = formData.get("nic") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const address = formData.get("address") as string;

  console.log("Registering patient:", name);

  try {
    // 2. Insert into Database
    await db.insert(patients).values({
      nic,
      name,
      phone,
      password, // Note: In a real app, we would hash this password!
      address,
      // Default empty values for medical data
      bloodType: "", 
      allergies: [],
    });

    console.log("Registration Successful!");

  } catch (error) {
    console.error("Registration Failed:", error);
    return { success: false, error: "NIC might already exist" };
  }

  // 3. Redirect to a success page or login
  redirect("/doctor"); // For now, we go back to the doctor page to test
}