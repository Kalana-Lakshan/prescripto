"use server";

import { db } from "@/db";
import { patients, prescriptions, medicalReports, notifications} from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Fetch Dashboard Data (Profile + History + Reports)
export async function getPatientDashboardData(nic: string) {
  try {
    const patientData = await db.select().from(patients).where(eq(patients.nic, nic)).limit(1);
    if (!patientData[0]) return null;

    const prescriptionHistory = await db.select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, nic))
      .orderBy(desc(prescriptions.createdAt));

    const reports = await db.select()
      .from(medicalReports)
      .where(eq(medicalReports.patientId, nic))
      .orderBy(desc(medicalReports.uploadedAt));

    // NEW: Fetch Notifications
    const alertList = await db.select()
      .from(notifications)
      .where(eq(notifications.patientId, nic))
      .orderBy(desc(notifications.createdAt));

    return {
      profile: patientData[0],
      history: prescriptionHistory,
      reports: reports,
      notifications: alertList // Return this
    };
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return null;
  }
}

// 2. Mark Notification as Read (Action)
export async function markAsRead(notificationId: number, nic: string) {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));
        
        revalidatePath(`/patient/dashboard/${nic}`);
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
// 2. Upload PDF Action
export async function uploadMedicalReport(formData: FormData) {
  const nic = formData.get("nic") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  if (file.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are allowed." };
  }

  try {
    // Convert File to Base64 String
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`;

    // Save to Database
    await db.insert(medicalReports).values({
      patientId: nic,
      fileName: file.name,
      fileData: base64Data,
    });

    revalidatePath(`/patient/dashboard/${nic}`);
    return { success: true };

  } catch (error) {
    console.error("Upload Error:", error);
    return { success: false, error: "Upload failed." };
  }
}