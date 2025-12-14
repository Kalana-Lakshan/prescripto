"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientDashboardData, uploadMedicalReport } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, UploadCloud, Pill, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PatientDashboard({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const [data, setData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [nic]);

  async function loadData() {
    const result = await getPatientDashboardData(nic);
    setData(result);
  }

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    const result = await uploadMedicalReport(formData);
    
    if (result.success) {
      toast.success("Report Uploaded Successfully!");
      loadData(); // Refresh list
    } else {
      toast.error(result.error || "Upload Failed");
    }
    setIsUploading(false);
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const { profile, history, reports } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <User className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{profile.name}</h1>
                <p className="text-slate-500 text-sm">NIC: {profile.nic}</p>
              </div>
           </div>
           <Link href="/">
             <Button variant="outline">Sign Out</Button>
           </Link>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          {/* 1. PRESCRIPTION HISTORY */}
          <TabsContent value="prescriptions" className="mt-6">
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Prescription History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No prescriptions found.</p>
                  ) : (
                    history.map((record: any) => (
                      <div key={record.id} className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition">
                         <div className="flex justify-between items-start mb-3 border-b pb-2">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                               <Calendar className="h-4 w-4" />
                               {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                              ID: #{record.id}
                            </span>
                         </div>
                         <div className="grid gap-2">
                            {Array.isArray(record.medicines) && record.medicines.map((med: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm text-slate-700">
                                   <span className="font-medium">• {med.name}</span>
                                   <span className="text-slate-500">{med.dosage} ({med.frequency})</span>
                                </div>
                            ))}
                         </div>
                      </div>
                    ))
                  )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* 2. MEDICAL REPORTS (Upload & View) */}
          <TabsContent value="reports" className="mt-6 space-y-6">
             
             {/* Upload Section */}
             <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
                <CardHeader>
                   <CardTitle className="text-base text-slate-600">Upload New Report (PDF)</CardTitle>
                </CardHeader>
                <CardContent>
                   <form action={handleUpload} className="flex gap-4 items-center">
                      <input type="hidden" name="nic" value={nic} />
                      <Input type="file" name="file" accept="application/pdf" required className="bg-white" />
                      <Button type="submit" disabled={isUploading} className="bg-green-600 hover:bg-green-700">
                         {isUploading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload</>}
                      </Button>
                   </form>
                </CardContent>
             </Card>

             {/* Reports List */}
             <Card>
                <CardHeader><CardTitle>My Documents</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                   {reports.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">No documents uploaded.</p>
                   ) : (
                      reports.map((file: any) => (
                         <div key={file.id} className="flex items-center justify-between p-3 border rounded bg-white">
                            <div className="flex items-center gap-3">
                               <div className="bg-red-100 p-2 rounded text-red-600">
                                  <FileText className="h-5 w-5" />
                               </div>
                               <div>
                                  <p className="font-medium text-slate-800">{file.fileName}</p>
                                  <p className="text-xs text-slate-500">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <a href={file.fileData} download={file.fileName}>
                               <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" /> Download
                               </Button>
                            </a>
                         </div>
                      ))
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          {/* 3. PROFILE DETAILS */}
          <TabsContent value="profile" className="mt-6">
             <Card>
               <CardHeader><CardTitle>Patient Details</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <p className="text-slate-500">Address</p>
                        <p className="font-medium">{profile.address}</p>
                     </div>
                     <div>
                        <p className="text-slate-500">Phone</p>
                        <p className="font-medium">{profile.phone}</p>
                     </div>
                     <div>
                        <p className="text-slate-500">Blood Type</p>
                        <p className="font-medium">{profile.bloodType || "N/A"}</p>
                     </div>
                     <div>
                        <p className="text-slate-500">Age</p>
                        <p className="font-medium">{profile.age || "N/A"}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t">
                     <p className="text-slate-500 mb-2">Allergies</p>
                     <div className="flex flex-wrap gap-2">
                        {profile.allergies?.map((alg: string, i: number) => (
                           <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                              {alg}
                           </span>
                        ))}
                        {(!profile.allergies || profile.allergies.length === 0) && <span className="text-slate-400">None</span>}
                     </div>
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}