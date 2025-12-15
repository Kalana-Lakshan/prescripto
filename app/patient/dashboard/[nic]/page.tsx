"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientDashboardData, uploadMedicalReport, markAsRead } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, FileText, UploadCloud, Pill, Download, Calendar, Siren, X, Bell, Stethoscope, Clock, CheckCircle } from "lucide-react";
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

  async function handleDismiss(id: number) {
    await markAsRead(id, nic);
    loadData();
    toast.success("Alert dismissed");
  }

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    const result = await uploadMedicalReport(formData);
    
    if (result.success) {
      toast.success("Report Uploaded Successfully!");
      loadData(); 
    } else {
      toast.error(result.error || "Upload Failed");
    }
    setIsUploading(false);
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  const { profile, history, reports, notifications = [] } = data;
  const unreadAlerts = notifications.filter((n: any) => !n.isRead && n.type === 'alert');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ALERT BANNER */}
        {unreadAlerts.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                {unreadAlerts.map((alert: any) => (
                    <div key={alert.id} className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r shadow-sm flex justify-between items-start">
                        <div className="flex gap-3">
                            <Siren className="h-6 w-6 text-red-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-800">Security Alert</h3>
                                <p className="text-red-700 text-sm">{alert.message}</p>
                                <p className="text-red-500 text-xs mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDismiss(alert.id)}
                            className="text-red-700 hover:bg-red-200 hover:text-red-900"
                        >
                            <X className="h-4 w-4 mr-1" /> Dismiss
                        </Button>
                    </div>
                ))}
            </div>
        )}

        {/* HEADER */}
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

        {/* TABS */}
        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="flex gap-2">
                <Bell className="h-4 w-4" /> 
                Alerts 
                {notifications.length > 0 && <span className="bg-slate-200 px-1.5 rounded-full text-xs font-bold text-slate-600">{notifications.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* 1. PRESCRIPTION HISTORY TAB (UPDATED UI) */}
          <TabsContent value="prescriptions" className="mt-6">
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Prescription History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Accordion type="single" collapsible className="w-full">
                      {history.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No prescriptions found.</p>
                      ) : (
                        history.map((record: any) => (
                          <AccordionItem key={record.id} value={`item-${record.id}`} className="border-b last:border-0 px-2">
                             <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 pr-4">
                                   
                                   {/* Left: Doctor Info */}
                                   <div className="flex items-center gap-3 text-left">
                                       <div className="bg-blue-100 p-2 rounded-full text-blue-700 shrink-0">
                                           <Stethoscope className="h-5 w-5" />
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-slate-800 text-lg leading-tight">
                                               {record.doctorName || "Unknown Doctor"}
                                           </h3>
                                           {/* UPDATED: Show Specialization */}
                                           <p className="text-xs text-blue-600 uppercase tracking-wide font-bold">
                                               {record.doctorSpecialization || "General Physician"}
                                           </p>
                                       </div>
                                   </div>

                                   {/* Right: Date & Time Badge */}
                                   <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 border px-3 py-1.5 rounded-lg shadow-sm w-fit md:w-auto">
                                       <div className="flex items-center gap-1.5">
                                           <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                           <span className="font-medium">
                                               {new Date(record.createdAt).toLocaleDateString()}
                                           </span>
                                       </div>
                                       <div className="w-px h-3 bg-slate-200"></div>
                                       <div className="flex items-center gap-1.5">
                                           <Clock className="h-3.5 w-3.5 text-slate-400" />
                                           <span className="font-medium">
                                               {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                           </span>
                                       </div>
                                   </div>

                                </div>
                             </AccordionTrigger>
                             
                             <AccordionContent className="pb-4 pt-2">
                                {/* Medicine Table */}
                                <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                                   <table className="w-full text-sm text-left">
                                      <thead className="bg-slate-100 text-slate-500 font-medium border-b">
                                          <tr>
                                              <th className="px-4 py-2">Medicine</th>
                                              <th className="px-4 py-2">Dosage</th>
                                              <th className="px-4 py-2">Frequency</th>
                                              <th className="px-4 py-2 text-right">Duration</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                          {Array.isArray(record.medicines) && record.medicines.map((med: any, i: number) => (
                                              <tr key={i} className="bg-white">
                                                  <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                                      <Pill className="h-3.5 w-3.5 text-blue-500" /> {med.name}
                                                  </td>
                                                  <td className="px-4 py-3 text-slate-600">{med.dosage}</td>
                                                  <td className="px-4 py-3 text-blue-600 font-bold">{med.frequency}</td>
                                                  <td className="px-4 py-3 text-right text-slate-700">{med.duration}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                   </table>
                                </div>
                                {record.status === 'dispensed' && (
                                  <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-md text-sm font-medium justify-center border border-green-100">
                                      <CheckCircle className="h-4 w-4" /> Dispensed by Pharmacy
                                  </div>
                                )}
                             </AccordionContent>
                          </AccordionItem>
                        ))
                      )}
                   </Accordion>
                </CardContent>
             </Card>
          </TabsContent>

          {/* 2. REPORTS TAB */}
          <TabsContent value="reports" className="mt-6 space-y-6">
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

          {/* 3. PROFILE TAB */}
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

          {/* 4. NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
                <CardHeader><CardTitle>Access Logs & Notifications</CardTitle></CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No notifications found.</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((n: any) => (
                                <div key={n.id} className={`p-4 border rounded-lg flex items-start gap-3 ${n.type === 'alert' ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
                                    {n.type === 'alert' ? <Siren className="h-5 w-5 text-red-500 mt-0.5" /> : <Bell className="h-5 w-5 text-slate-400 mt-0.5" />}
                                    <div>
                                        <p className={`font-medium text-sm ${n.type === 'alert' ? 'text-red-900' : 'text-slate-700'}`}>{n.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}