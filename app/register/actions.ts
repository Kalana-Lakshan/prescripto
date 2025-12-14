"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";

export async function registerPatient(formData: FormData) {
  const nic = formData.get("nic") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const password = formData.get("password") as string;
  
  // Get Optional Fields
  const bloodType = formData.get("bloodType") as string;
  const age = formData.get("age") as string;
  const allergiesRaw = formData.get("allergies") as string;

  // Process Allergies: Convert "A, B" string into ["A", "B"] array
  let allergiesList: string[] = [];
  if (allergiesRaw && allergiesRaw.trim() !== "") {
      allergiesList = allergiesRaw.split(',').map(item => item.trim());
  }

  try {
    await db.insert(patients).values({
      nic,
      name,
      phone,
      address,
      password,
      // Add the new fields
      bloodType: bloodType || null, // Save null if empty
      age: age ? parseInt(age) : null,
      allergies: allergiesList, // This assumes your DB column is text[] or json
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Registration failed. NIC might already exist." };
  }
}