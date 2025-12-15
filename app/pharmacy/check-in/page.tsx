"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPharmacyName, joinPharmacyQueue, checkOrderStatus, getActivePrescriptions } from "./actions"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Store, CheckCircle, Loader2, Clock, ShoppingBag, FileText, ChevronRight } from "lucide-react";

function CheckInForm() {
  const searchParams = useSearchParams();
  const license = searchParams.get("license");

  const [pharmacyName, setPharmacyName] = useState("Loading...");
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);
  
  // New State for handling Multiple Prescriptions
  const [activeScripts, setActiveScripts] = useState<any[]>([]);

  // States: 'form' | 'selection' | 'waiting' | 'ready'
  const [viewState, setViewState] = useState<'form' | 'selection' | 'waiting' | 'ready'>('form');

  // 1. Load Pharmacy Name
  useEffect(() => {
    if (!license) return;
    async function load() {
      const data = await getPharmacyName(license!);
      if (data) setPharmacyName(data.name);
    }
    load();
  }, [license]);

  // 2. POLLING EFFECT (1 second interval)
  useEffect(() => {
    if (viewState !== 'waiting' || !license || !nic) return;

    const interval = setInterval(async () => {
      const result = await checkOrderStatus(license, nic);
      if (result.ready) {
        setViewState('ready');
        // Trigger vibration if supported on mobile
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, license, nic]);

  // --- LOGIC 1: INITIAL CHECK (Fetch Prescriptions) ---
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic || !license) return;
    setLoading(true);

    // Fetch available prescriptions for this NIC
    const scripts = await getActivePrescriptions(nic);

    if (scripts.length === 0) {
        toast.error("No active prescriptions found for this NIC.");
        setLoading(false);
        return;
    }

    if (scripts.length === 1) {
        // Only one found? Auto-select and join queue immediately.
        await submitToQueue(scripts[0].id);
    } else {
        // Multiple found? Show selection screen.
        setActiveScripts(scripts);
        setViewState('selection');
        setLoading(false);
    }
  };

  // --- LOGIC 2: FINAL SUBMIT (Join Queue) ---
  const submitToQueue = async (prescriptionId: number) => {
    setLoading(true);
    
    // Call the updated action that accepts prescriptionId
    const result = await joinPharmacyQueue(license!, nic, prescriptionId);

    if (result.success) {
      setViewState('waiting'); // Move to waiting screen
      toast.success("Prescription sent to pharmacy!");
    } else {
      toast.error(result.error || "Failed to join queue");
      setLoading(false);
    }
  };

  if (!license) return <div className="p-6 text-center text-red-500">Invalid QR Code</div>;

  // --- VIEW 4: READY (Dispensed) ---
  if (viewState === 'ready') {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center p-6 animate-in zoom-in duration-300">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-green-100 p-6 rounded-full w-fit mx-auto animate-bounce">
              <ShoppingBag className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-green-800 uppercase tracking-tight">Order Ready!</h1>
              <p className="text-slate-600 mt-2 text-lg">
                Please collect your medicine from the counter at <span className="font-bold">{pharmacyName}</span>.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 font-medium">
               Thank you for using Prescripto.
            </div>
            <Button onClick={() => window.close()} className="w-full bg-slate-900 hover:bg-slate-800">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 3: WAITING (Polling) ---
  if (viewState === 'waiting') {
    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 animate-in fade-in">
        <Card className="max-w-md w-full border-4 border-amber-400 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-amber-100 p-6 rounded-full w-fit mx-auto">
              <Clock className="h-16 w-16 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-800">Order Processing...</h1>
              <p className="text-slate-600 mt-2">
                You are in the queue at <span className="font-bold">{pharmacyName}</span>.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100 text-sm text-slate-500">
               <div className="flex items-center justify-center gap-2 mb-1">
                 <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> 
                 <span className="font-bold text-amber-600">Live Status</span>
               </div>
               Please keep this screen open. It will update automatically when your medicine is ready.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: SELECTION (Multiple Prescriptions) ---
  if (viewState === 'selection') {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in slide-in-from-right">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="bg-blue-600 text-white rounded-t-xl pb-6">
                    <CardTitle>Select Prescription</CardTitle>
                    <p className="text-blue-100 text-sm">Multiple active prescriptions found.</p>
                </CardHeader>
                <CardContent className="p-4 space-y-3 -mt-4 bg-white rounded-xl">
                    {activeScripts.map((script) => (
                        <div 
                            key={script.id}
                            onClick={() => submitToQueue(script.id)} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{script.doctorName}</p>
                                    <p className="text-xs text-slate-500">
                                        Date: {new Date(script.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                        </div>
                    ))}
                    <Button variant="ghost" onClick={() => setViewState('form')} className="w-full mt-2 text-slate-500">
                        Cancel & Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  // --- VIEW 1: FORM (Initial) ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-blue-600">
        <CardHeader className="text-center pb-2">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
             <Store className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Welcome to {pharmacyName}</CardTitle>
          <p className="text-sm text-slate-500">Enter your ID to check for prescriptions</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Patient NIC Number</label>
              <Input 
                placeholder="e.g. 199912345678" 
                value={nic} 
                onChange={(e) => setNic(e.target.value)} 
                className="h-12 text-lg"
                required
              />
            </div>
            
            <Button disabled={loading} type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Check Prescriptions"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PharmacyCheckInPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CheckInForm />
    </Suspense>
  );
}