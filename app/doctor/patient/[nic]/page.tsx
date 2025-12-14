"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // You need shadcn Tabs
import { FileText, User, AlertTriangle, PlusCircle, ArrowLeft, Download, Calendar, Pill } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientProfilePage({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getPatientProfile(nic);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [nic]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-500">Loading Patient Records...</p>
    </div>
  );

  if (!data || !data.patient) return <div className="p-10 text-center text-red-500">Patient not found.</div>;

    // Default reports to an empty array [] if it comes back undefined
    const { patient, history, reports = [] } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
        </div>

        {/* SECTION 1: Patient Identity & Critical Alerts (Side-by-Side) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Identity Card (2 Columns) */}
            <Card className="md:col-span-2 border-t-4 border-blue-600 shadow-md">
                <CardContent className="p-6 flex items-start gap-5">
                    <div className="bg-blue-100 p-4 rounded-full hidden sm:block">
                        <User className="h-8 w-8 text-blue-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                        <p className="text-slate-500 font-mono">NIC: {patient.nic}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                                {patient.address || "No Address"}
                            </span>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                                {patient.phone || "No Phone"}
                            </span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">
                                Age: {patient.age || "N/A"}
                            </span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold">
                                Blood: {patient.bloodType || "N/A"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Critical Alerts Card (1 Column) - ALWAYS VISIBLE */}
            <Card className={`border-t-4 shadow-md ${patient.allergies?.length > 0 ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                        <AlertTriangle className={`h-4 w-4 ${patient.allergies?.length > 0 ? "text-red-600" : "text-green-600"}`} />
                        <span className={patient.allergies?.length > 0 ? "text-red-700" : "text-green-700"}>
                            Critical Alerts
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
                            patient.allergies.map((alg: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-white text-red-600 text-xs font-bold border border-red-200 rounded-full shadow-sm">
                                    {alg}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm font-medium text-green-700">No Known Allergies</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* SECTION 2: Actions */}
        <Link href={`/doctor/patient/${nic}/new`}>
            <Button className="w-full bg-blue-800 hover:bg-blue-900 h-14 text-lg shadow-lg transition-transform hover:-translate-y-1">
                <PlusCircle className="mr-2 h-6 w-6" /> Write New Prescription
            </Button>
        </Link>

        {/* SECTION 3: Tabbed History & Reports */}
        <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-200">
                <TabsTrigger value="history" className="text-base">Prescription History</TabsTrigger>
                <TabsTrigger value="reports" className="text-base">Medical Reports</TabsTrigger>
            </TabsList>

            {/* TAB 1: PRESCRIPTION HISTORY */}
            <TabsContent value="history" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-blue-600" /> Past Prescriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">No past records found.</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((record: any) => (
                                    <div key={record.id} className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition shadow-sm">
                                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {new Date(record.createdAt).toLocaleDateString()}
                                            </div>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                ID: #{record.id}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                            {Array.isArray(record.medicines) && record.medicines.map((med: any, i: number) => (
                                                <div key={i} className="flex justify-between text-sm border-b border-slate-100 pb-1 last:border-0">
                                                    <span className="font-medium text-slate-800">{med.name}</span>
                                                    <span className="text-slate-500">{med.dosage} ({med.frequency})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB 2: MEDICAL REPORTS */}
            <TabsContent value="reports" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" /> Patient Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
                                <FileText className="h-10 w-10 opacity-20" />
                                <p>No documents uploaded by patient.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reports.map((file: any) => (
                                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-red-100 p-2 rounded text-red-600 flex-shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{file.fileName}</p>
                                                <p className="text-xs text-slate-500">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <a href={file.fileData} download={file.fileName}>
                                            <Button variant="outline" size="sm" className="ml-2">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
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