"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPharmacyName, joinPharmacyQueueBatch, checkOrderStatus, getActivePrescriptions } from "./actions"; // Use Batch Action
import { loginPatient, getPatientSession } from "@/app/patient/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Loader2, Clock, ShoppingBag, Eye, X, CheckSquare, Square, Lock } from "lucide-react";

function CheckInForm() {
  const searchParams = useSearchParams();
  const license = searchParams.get("license");

  // State
  const [pharmacyName, setPharmacyName] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; nic: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Prescription State
  const [activeScripts, setActiveScripts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // Array of selected IDs
  const [viewingScript, setViewingScript] = useState<any>(null); // Script currently being viewed in modal

  // View State
  const [viewState, setViewState] = useState<'form' | 'selection' | 'waiting' | 'ready'>('form');

  // 1. INITIAL LOAD
  useEffect(() => {
    if (!license) return;
    getPharmacyName(license).then((data) => data && setPharmacyName(data.name));
    getPatientSession().then((session) => {
        if (session) setUser(session);
        setAuthLoading(false);
    });
  }, [license]);

  // 2. POLLING
  useEffect(() => {
    if (viewState !== 'waiting' || !license || !user) return;
    const interval = setInterval(async () => {
      const result = await checkOrderStatus(license, user.nic);
      if (result.ready) {
        setViewState('ready');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [viewState, license, user]);

  // LOGIN HANDLER
  const handleLogin = async (formData: FormData) => {
    setLoading(true);
    const result = await loginPatient(formData);
    if (result.success && result.patient) {
      setUser(result.patient);
      toast.success(`Welcome back, ${result.patient.name}`);
    } else {
      toast.error(result.error || "Login Failed");
    }
    setLoading(false);
  };

  // CHECK PRESCRIPTIONS HANDLER
  const handleCheckIn = async () => {
    if (!user || !license) return;
    setLoading(true);

    const scripts = await getActivePrescriptions(user.nic);

    if (scripts.length === 0) {
        toast.error("No active prescriptions found.");
        setLoading(false);
        return;
    }

    // Default: Select all if multiple
    setActiveScripts(scripts);
    setSelectedIds(scripts.map((s: any) => s.id));
    setViewState('selection');
    setLoading(false);
  };

  // TOGGLE SELECTION
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // SUBMIT SELECTED (BATCH)
  const submitSelection = async () => {
    if (!user || selectedIds.length === 0) {
        toast.error("Please select at least one prescription.");
        return;
    }
    setLoading(true);
    
    // Call the BATCH action
    const result = await joinPharmacyQueueBatch(license!, user.nic, selectedIds);

    if (result.success) {
      setViewState('waiting');
      toast.success(`Sent ${result.count} prescriptions to pharmacy!`);
    } else {
      toast.error(result.error || "Failed to join queue");
      setLoading(false);
    }
  };

  if (!license) return <div className="p-6 text-center text-red-500">Invalid QR Code</div>;
  if (authLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading...</div>;

  // --- MODAL: PRESCRIPTION DETAILS ---
  const DetailsModal = () => {
    if (!viewingScript) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
                <CardHeader className="border-b pb-3 sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg text-slate-800">{viewingScript.doctorName}</CardTitle>
                            <CardDescription>{new Date(viewingScript.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setViewingScript(null)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                     <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Medicines</h4>
                     <div className="space-y-3">
                        {Array.isArray(viewingScript.medicines) && viewingScript.medicines.map((med: any, i: number) => (
                            <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-2 last:border-0">
                                <div>
                                    <p className="font-bold text-slate-700">{med.name}</p>
                                    {med.duration && <p className="text-xs text-slate-400">Duration: {med.duration}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-600">{med.dosage}</p>
                                    <p className="text-xs text-slate-400">{med.frequency}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                     <Button className="w-full mt-4" onClick={() => setViewingScript(null)}>Close Details</Button>
                </CardContent>
            </Card>
        </div>
    );
  };

  // --- VIEW: SELECTION (New Logic) ---
  if (viewState === 'selection') {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in slide-in-from-right relative">
            {/* Modal Overlay */}
            <DetailsModal />

            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="bg-blue-600 text-white rounded-t-xl pb-6">
                    <CardTitle>Select Prescriptions</CardTitle>
                    <p className="text-blue-100 text-sm">Select the prescriptions you want to buy.</p>
                </CardHeader>
                <CardContent className="p-4 space-y-3 -mt-4 bg-white rounded-xl">
                    {activeScripts.map((script) => {
                        const isSelected = selectedIds.includes(script.id);
                        return (
                            <div key={script.id} className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                                
                                {/* 1. CHECKBOX AREA */}
                                <div onClick={() => toggleSelection(script.id)} className="cursor-pointer text-blue-600">
                                    {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6 text-slate-300" />}
                                </div>

                                {/* 2. INFO AREA */}
                                <div className="flex-1 cursor-pointer" onClick={() => toggleSelection(script.id)}>
                                    <p className="font-bold text-slate-800">{script.doctorName}</p>
                                    <p className="text-xs text-slate-500">Date: {new Date(script.createdAt).toLocaleDateString()}</p>
                                </div>

                                {/* 3. DETAILS BUTTON */}
                                <Button variant="ghost" size="icon" onClick={() => setViewingScript(script)} className="text-slate-400 hover:text-blue-600">
                                    <Eye className="h-5 w-5" />
                                </Button>
                            </div>
                        );
                    })}

                    <div className="pt-2 space-y-2">
                        <Button onClick={submitSelection} disabled={loading} className="w-full h-11 text-lg bg-blue-600 hover:bg-blue-700 shadow-md">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Submit Selected (${selectedIds.length})`}
                        </Button>
                        <Button variant="ghost" onClick={() => setViewState('form')} className="w-full text-slate-500">Cancel</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  // --- VIEW: READY ---
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
                Please collect your medicine from <span className="font-bold">{pharmacyName}</span>.
              </p>
            </div>
            <Button onClick={() => window.close()} className="w-full bg-slate-900 hover:bg-slate-800">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW: WAITING ---
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
              <p className="text-slate-600 mt-2">You are in the queue at <span className="font-bold">{pharmacyName}</span>.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100 text-sm text-slate-500">
               <div className="flex items-center justify-center gap-2 mb-1">
                 <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> 
                 <span className="font-bold text-amber-600">Live Status</span>
               </div>
               Please keep this screen open.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW: LOGIN / CHECK-IN FORM ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg border-t-4 border-slate-600">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-4">
                    <Lock className="h-6 w-6 text-slate-700" />
                </div>
                <CardTitle className="text-xl">Login Required</CardTitle>
                <CardDescription>
                    Please login to check in at <span className="font-bold text-slate-900">{pharmacyName}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form action={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label>NIC Number</Label>
                        <Input name="nic" placeholder="e.g. 199912345678" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input name="password" type="password" placeholder="••••••" required />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login & Continue"}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    );
  }

  // CONFIRM CHECK-IN (Logged in)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-blue-600">
        <CardHeader className="text-center pb-2">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
             <Store className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Welcome, {user.name}</CardTitle>
          <p className="text-sm text-slate-500">Checking in at {pharmacyName}</p>
        </CardHeader>
        
        <CardContent className="p-6">
           <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 text-center">
              Click below to view your available prescriptions and join the queue.
           </div>

           <Button onClick={handleCheckIn} disabled={loading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Check for Prescriptions"}
           </Button>
           
           <p className="text-xs text-center text-slate-400 mt-6">
              Logged in as {user.nic}
           </p>
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