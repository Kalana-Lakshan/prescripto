"use client";

import React, { useEffect, useState, use } from "react";
import { getPatientDetails } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // You might need to install/add this component or remove if not using shadcn
import { Button } from "@/components/ui/button";
import { FileText, User, AlertTriangle, Clock, PlusCircle } from "lucide-react";

export default function PatientProfilePage({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getPatientDetails(nic);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [nic]);

  if (loading) return <div className="p-10 text-center">Loading Patient Records...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Patient not found.</div>;

  const { profile, history } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER: Patient Identity */}
        <Card className="border-t-4 border-blue-600 shadow-md">
          <CardHeader className="flex flex-row justify-between items-start">
            <div className="flex gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-slate-500 font-mono">NIC: {profile.nic}</p>
                <div className="flex gap-2 mt-2">
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                     {profile.address || "No Address"}
                   </span>
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                     {profile.phone || "No Phone"}
                   </span>
                </div>
              </div>
            </div>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <PlusCircle className="mr-2 h-4 w-4" /> New Prescription
            </Button>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Critical Info */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Allergies */}
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-red-700">Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Check if allergies exist and is an array */}
                    {Array.isArray(profile.allergies) && profile.allergies.length > 0 
                      ? profile.allergies.map((alg: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-white text-red-600 text-xs font-bold border border-red-200 rounded-full">
                            {alg}
                          </span>
                        ))
                      : <span className="text-sm text-slate-400">No Known Allergies</span>
                    }
                  </div>
                </div>

                {/* Blood Type */}
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Blood Type</span>
                  <span className="font-bold text-lg text-slate-700">{profile.bloodType || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Medical History */}
          <div className="md:col-span-2">
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  Visit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    No past prescriptions found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((record: any) => (
                      <div key={record.id} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-blue-900">
                            Prescription #{record.id}
                          </span>
                          <span className="text-sm text-slate-500">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Display medicines simply for now */}
                        <div className="text-sm text-slate-600 bg-white p-3 rounded border">
                          {JSON.stringify(record.medicines)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}