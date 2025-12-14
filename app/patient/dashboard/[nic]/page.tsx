"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientDashboardData } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, FileText, AlertTriangle, Home, Activity } from "lucide-react";
import Link from "next/link";

export default function PatientDashboard({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getPatientDashboardData(nic);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [nic]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Dashboard...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Account not found.</div>;

  const { profile, history } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER: Profile Summary */}
        <Card className="border-t-4 border-blue-600 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">{profile.name}</CardTitle>
                <CardDescription>NIC: {profile.nic}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-600">
               <Home className="h-4 w-4" />
               <span>{profile.address || "No Address Provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
               <Activity className="h-4 w-4" />
               <span>Blood Type: <span className="font-bold">{profile.bloodType || "N/A"}</span></span>
            </div>
          </CardContent>
        </Card>

        {/* ALERTS SECTION */}
        <Card className="bg-red-50 border border-red-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Allergies & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-wrap gap-2">
                {Array.isArray(profile.allergies) && profile.allergies.length > 0 
                  ? profile.allergies.map((alg: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white text-red-600 text-sm font-medium border border-red-200 rounded-full">
                        {alg}
                      </span>
                    ))
                  : <span className="text-sm text-slate-500">No known allergies recorded.</span>
                }
             </div>
          </CardContent>
        </Card>

        {/* MEDICAL HISTORY / PRESCRIPTIONS */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Past Prescriptions & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No medical records found.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record: any) => (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-slate-50 transition bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-800">
                        Prescription #{record.id}
                      </span>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Medicines List */}
                    <div className="text-sm text-slate-600 mt-2">
                      <p className="font-medium text-xs text-slate-400 uppercase mb-1">Medicines Prescribed:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray(record.medicines) ? (
                            record.medicines.map((med: any, i: number) => (
                                <li key={i}>
                                    {med.name || med.drug} - {med.dosage} ({med.frequency})
                                </li>
                            ))
                        ) : (
                            <li>Details unavailable</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* LOGOUT / BACK BUTTON */}
        <div className="text-center">
            <Link href="/">
                <Button variant="outline">Sign Out</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}