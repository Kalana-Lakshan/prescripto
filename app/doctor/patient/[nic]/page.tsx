"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, User, AlertTriangle, PlusCircle, ArrowLeft, Download, Calendar, Pill, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function PatientProfilePage({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorSlmc = searchParams.get("doctor");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getPatientProfile(nic);
      setData(result);
    }
    loadData();
  }, [nic]);

  if (!data || !data.patient) return <div className="p-10 text-center">Loading Records...</div>;

  const { patient, history, reports = [] } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back & Header (Same as before) */}
        <div className="flex justify-between items-center">
             <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
             {doctorSlmc && (
                <Link href={`/doctor/patient/${nic}/new?doctor=${doctorSlmc}`}>
                    <Button className="bg-blue-800 hover:bg-blue-900"><PlusCircle className="mr-2 h-4 w-4" /> New Prescription</Button>
                </Link>
             )}
        </div>

        {/* Identity Card & Alerts (Same as before) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-t-4 border-blue-600 shadow-sm">
                <CardContent className="p-6 flex gap-4">
                    <div className="bg-blue-100 p-4 rounded-full h-fit"><User className="h-8 w-8 text-blue-700"/></div>
                    <div>
                        <h1 className="text-2xl font-bold">{patient.name}</h1>
                        <p className="text-slate-500">NIC: {patient.nic}</p>
                        <div className="flex gap-2 mt-2">
                             <span className="text-xs bg-slate-100 px-2 py-1 rounded">Age: {patient.age || "N/A"}</span>
                             <span className="text-xs bg-slate-100 px-2 py-1 rounded">Blood: {patient.bloodType || "N/A"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className={`border-t-4 shadow-sm ${patient.allergies?.length > 0 ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}>
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase">Critical Alerts</CardTitle></CardHeader>
                <CardContent>
                    {patient.allergies?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">{patient.allergies.map((alg: string, i: number) => <span key={i} className="px-2 py-1 bg-white text-red-600 text-xs font-bold border border-red-200 rounded-full">{alg}</span>)}</div>
                    ) : <span className="text-green-700 font-medium">No Allergies</span>}
                </CardContent>
            </Card>
        </div>

        {/* TABS SECTION */}
        <Tabs defaultValue="history" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger value="history" className="rounded-t-lg data-[state=active]:bg-white data-[state=active]:border-b-0 border border-transparent px-6">Prescription History</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-t-lg data-[state=active]:bg-white data-[state=active]:border-b-0 border border-transparent px-6">Medical Reports</TabsTrigger>
            </TabsList>

            {/* TAB 1: HISTORY (Updated) */}
            <TabsContent value="history" className="mt-4">
                <Card>
                    <CardContent className="p-0">
                        {history.length === 0 ? <div className="p-8 text-center text-slate-400">No records found.</div> : (
                            <div className="divide-y divide-slate-100">
                                {history.map((record: any) => (
                                    <div key={record.id} className="p-6 hover:bg-slate-50 transition">
                                        {/* Row Header: Date & Doctor Name */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(record.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                                    {/* DISPLAY DOCTOR NAME HERE */}
                                                    Prescribed by {record.doctorName || "Unknown Doctor"}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400">ID: #{record.id}</span>
                                        </div>

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
                                                        <tr key={i}>
                                                            <td className="px-4 py-2 font-medium text-slate-800">{med.name}</td>
                                                            <td className="px-4 py-2 text-slate-600">{med.dosage}</td>
                                                            <td className="px-4 py-2 text-blue-600 font-bold">{med.frequency}</td>
                                                            {/* DISPLAY DURATION HERE */}
                                                            <td className="px-4 py-2 text-right text-slate-700">{med.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB 2: REPORTS (Kept Simple) */}
            <TabsContent value="reports" className="mt-4">
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="font-medium text-slate-700">{file.fileName}</p>
                                        <p className="text-xs text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <a href={file.fileData} download={file.fileName}>
                                    <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                                </a>
                            </div>
                        ))}
                        {reports.length === 0 && <p className="text-slate-400 col-span-2 text-center">No reports uploaded.</p>}
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}