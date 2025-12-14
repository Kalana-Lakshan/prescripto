"use client";

import React, { useState, useEffect, use } from "react"; 
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Stethoscope } from "lucide-react"; 
import { toast } from "sonner";
import { getQueue, acceptPatient, getDoctorProfile } from "./actions";

export default function DoctorQRPage({ params }: { params: Promise<{ slmc: string }> }) {
  
  const { slmc } = use(params);

  const [baseUrl, setBaseUrl] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [doctorName, setDoctorName] = useState("Loading...");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    // 1. Fetch Doctor Name immediately
    async function loadProfile() {
      const doc = await getDoctorProfile(slmc);
      if (doc) setDoctorName(doc.name);
      else setDoctorName("Unknown Doctor");
    }
    loadProfile();

    // 2. Poll for queue
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [slmc]);

  const fetchQueue = async () => {
    const data = await getQueue(slmc);
    setQueue(data);
  };

  // UPDATED FUNCTION: Now accepts 'patientNic' and opens the new tab
  const handleAccept = async (reqId: number, patientName: string, patientNic: string) => {
    const result = await acceptPatient(reqId);
    
    if (result.success) {
      toast.success(`Access Granted to ${patientName}`);
      
      // 1. Open the Patient Profile in a New Tab
      window.open(`/doctor/patient/${patientNic}`, '_blank');
      
      // 2. Refresh the queue to remove them from the list
      fetchQueue(); 
    } else {
        toast.error("Failed to accept request");
    }
  };

  const qrData = `${baseUrl}/access/grant?doctor=${slmc}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col md:flex-row gap-6 justify-center max-w-6xl mx-auto">
      
      {/* LEFT: QR Code Panel */}
      <Card className="w-full md:w-1/3 h-fit bg-white shadow-md border-t-4 border-blue-900">
        <CardHeader className="bg-slate-50 border-b text-center pb-6">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
            <Stethoscope className="h-8 w-8 text-blue-900" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{doctorName}</h1>
          <p className="text-sm font-medium text-slate-500">SLMC: {slmc}</p>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center py-8 space-y-4">
          <div className="text-center space-y-1 mb-2">
             <h2 className="font-semibold text-slate-800">Scan to Connect</h2>
             <p className="text-xs text-slate-400">Patient Access Portal</p>
          </div>

          {baseUrl && (
            <div className="p-4 bg-white border-4 border-slate-900 rounded-xl shadow-sm">
              <QRCode value={qrData} size={180} />
            </div>
          )}
          
          <p className="text-xs text-slate-400 text-center max-w-[200px] leading-relaxed">
             Ask your patient to scan this QR code to grant you temporary access to their medical records.
          </p>
        </CardContent>
      </Card>

      {/* RIGHT: The Waiting List */}
      <Card className="w-full md:w-2/3 shadow-md border-t-4 border-green-600">
        <CardHeader className="flex flex-row justify-between items-center border-b bg-slate-50">
          <div>
            <CardTitle className="text-lg">Waiting Room</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              {queue.length} {queue.length === 1 ? 'patient' : 'patients'} waiting for confirmation
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchQueue} className="bg-white hover:bg-slate-100">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
              <div className="bg-slate-100 p-4 rounded-full">
                <RefreshCw className="h-6 w-6 opacity-20" />
              </div>
              <p>No active requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition duration-200">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      {req.patientName}
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                       <span>NIC: <span className="font-mono text-slate-700">{req.patientId}</span></span>
                       <span>•</span>
                       <span className="text-xs">
                         {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all"
                    // UPDATED: Passing req.patientId (NIC) to the handler
                    onClick={() => handleAccept(req.id, req.patientName, req.patientId)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}