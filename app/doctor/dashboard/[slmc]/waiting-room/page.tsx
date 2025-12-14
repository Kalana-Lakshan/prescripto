"use client";

import React, { useEffect, useState, use } from "react";
import { getQueue, acceptPatient } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, CheckCircle, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WaitingRoomPage({ params }: { params: Promise<{ slmc: string }> }) {
  const { slmc } = use(params); // Get YOUR Doctor ID
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);

  // ... (keep fetchQueue function as is) ...

  const fetchQueue = async () => {
    const data = await getQueue(slmc);
    setQueue(data);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Auto-refresh
    return () => clearInterval(interval);
  }, [slmc]);


  // --- THIS IS THE CRITICAL FIX ---
  const handleAccept = async (reqId: number, patientNic: string) => {
    // 1. Mark patient as "active" in database
    const result = await acceptPatient(reqId);
    
    if (result.success) {
      toast.success("Patient Accepted");
      
      // 2. Open Patient Profile AND pass your Doctor ID
      // This ensures the "New Prescription" button works instantly
      window.open(`/doctor/patient/${patientNic}?doctor=${slmc}`, '_blank');
      
      // 3. Refresh the list to remove them from the queue
      fetchQueue(); 
    } else {
      toast.error("Failed to accept patient");
    }
  };
  // --------------------------------

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
             <Link href={`/doctor/dashboard/${slmc}`}>
                <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
             </Link>
             <h1 className="text-2xl font-bold text-slate-800">Waiting Room Queue</h1>
        </div>

        {/* Queue List */}
        <Card>
            <CardHeader><CardTitle>Patients Waiting ({queue.length})</CardTitle></CardHeader>
            <CardContent>
                {queue.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No patients in queue.</div>
                ) : (
                    <div className="space-y-3">
                        {queue.map((req) => (
                            <div key={req.id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <User className="h-6 w-6 text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{req.patientName}</h3>
                                        <div className="flex gap-2 text-sm text-slate-500">
                                            <span className="font-mono bg-slate-100 px-2 rounded">NIC: {req.patientId}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> Joined: {new Date(req.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleAccept(req.id, req.patientId)} 
                                    className="bg-green-600 hover:bg-green-700 h-10 px-6"
                                >
                                    Accept & Open Record <CheckCircle className="ml-2 h-4 w-4" />
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