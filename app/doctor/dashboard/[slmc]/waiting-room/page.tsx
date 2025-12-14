"use client";

import React, { useState, useEffect, use } from "react";
import { getQueue, acceptPatient, getDoctorProfile } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function WaitingRoomPage({ params }: { params: Promise<{ slmc: string }> }) {
  const { slmc } = use(params);
  const [queue, setQueue] = useState<any[]>([]);

  // Poll for new patients every 3 seconds
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [slmc]);

  const fetchQueue = async () => {
    const data = await getQueue(slmc);
    setQueue(data);
  };

  const handleAccept = async (reqId: number, patientName: string, patientNic: string) => {
    const result = await acceptPatient(reqId);
    if (result.success) {
      toast.success(`Access Granted to ${patientName}`);
      // Open Patient Record in New Tab
      window.open(`/doctor/patient/${patientNic}`, '_blank');
      fetchQueue(); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href={`/doctor/dashboard/${slmc}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    Waiting Room Management
                </h1>
            </div>
            <Button variant="outline" onClick={fetchQueue}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
            </Button>
        </div>

        {/* Queue List */}
        <Card className="shadow-md border-t-4 border-green-600">
            <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Patients in Queue ({queue.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            {queue.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 opacity-20" />
                    <p>No active patients waiting.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                {queue.map((req) => (
                    <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{req.patientName}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                {req.patientId}
                            </span>
                            <span>•</span>
                            <span>Waiting since {new Date(req.createdAt).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        onClick={() => handleAccept(req.id, req.patientName, req.patientId)}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" /> Accept Patient
                    </Button>
                    </div>
                ))}
                </div>
            )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}