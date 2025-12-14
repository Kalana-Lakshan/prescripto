"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createAccessRequest, checkRequestStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Share2, BellRing, UserCheck } from "lucide-react";

function GrantAccessContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctor");
  
  const [loading, setLoading] = useState(false);
  const [patientNic, setPatientNic] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

  // 1. Handle Form Submission
  async function handleRequest(formData: FormData) {
    if (!doctorId) {
      toast.error("Invalid QR Code");
      return;
    }
    setLoading(true);
    const nic = formData.get("nic") as string;

    const result = await createAccessRequest(formData, doctorId);

    if (result.success) {
      setPatientNic(nic); // Switch to "Waiting Mode"
      toast.success("Request Sent!");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  // 2. Polling Logic (The "Live" Check)
  useEffect(() => {
    // Only run if we are waiting (have NIC, have Doctor, and not yet active)
    if (!patientNic || !doctorId || status === "active") return;

    const interval = setInterval(async () => {
      const result = await checkRequestStatus(patientNic, doctorId);
      
      if (result?.status === "active") {
        setStatus("active");
        
        // Vibrate phone to alert user
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        
        toast.success("Doctor is Ready!", {
             description: "Please proceed to the consultation room.",
             duration: 10000,
        });
      }
    }, 1000); // <--- UPDATED: Checks every 1 second (1000ms)

    return () => clearInterval(interval);
  }, [patientNic, doctorId, status]);


  // VIEW 1: Doctor Accepted (Active)
  if (status === "active") {
    return (
      <Card className="w-full max-w-sm text-center p-8 bg-green-600 border-4 border-white shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <BellRing className="h-12 w-12 text-green-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">You're Up!</h2>
        <p className="text-green-50 text-lg font-medium leading-relaxed">
          Dr. {doctorId} is ready to see you now.
        </p>
        <div className="mt-8 bg-green-700/50 p-4 rounded-lg">
            <p className="text-white text-sm">Please proceed inside.</p>
        </div>
      </Card>
    );
  }

  // VIEW 2: Waiting in Queue (Pending)
  if (patientNic) {
    return (
      <Card className="w-full max-w-sm text-center p-8 bg-slate-50 border-2 border-blue-200 shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full relative">
            <UserCheck className="h-10 w-10 text-blue-600" />
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800">You are in the Queue</h2>
        <p className="text-slate-500 mt-2 text-sm">
           Waiting for Dr. {doctorId}...
        </p>
        <p className="text-xs text-slate-400 mt-6 animate-pulse">
           Checking status...
        </p>
      </Card>
    );
  }

  // VIEW 3: Error (Invalid QR)
  if (!doctorId) {
    return (
      <Card className="w-full max-w-sm p-6 bg-red-50 text-red-800 text-center">
        <h2 className="font-bold">Invalid QR Code</h2>
      </Card>
    );
  }

  // VIEW 4: Initial Form (Grant Access)
  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
          <Share2 className="h-6 w-6 text-blue-700" />
        </div>
        <CardTitle className="text-xl text-slate-800">Share Medical Access</CardTitle>
        <CardDescription>
          Grant temporary access to <span className="font-bold text-slate-900">Dr. {doctorId}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={handleRequest} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="nic">Enter your NIC to confirm</Label>
            <Input 
              id="nic" 
              name="nic" 
              placeholder="e.g. 198512345678" 
              className="text-lg py-5"
              required 
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-700 hover:bg-blue-800 text-lg py-6" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Grant Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Suspense Wrapper
export default function GrantAccessPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<p className="text-slate-500">Loading secure link...</p>}>
        <GrantAccessContent />
      </Suspense>
    </div>
  );
}