"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createAccessRequest, checkRequestStatus, getDoctorName } from "./actions";
import { loginPatient, getPatientSession } from "@/app/patient/auth"; // Import Auth Actions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Share2, BellRing, UserCheck, Lock } from "lucide-react";

function GrantAccessContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctor");
  
  // Auth State
  const [user, setUser] = useState<{ name: string; nic: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Request State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending");
  const [doctorName, setDoctorName] = useState("Loading...");

  // 1. INITIAL LOAD: Check Session & Doctor Name
  useEffect(() => {
    if (!doctorId) return;

    // A. Get Doctor Name
    getDoctorName(doctorId).then((name) => setDoctorName(name || `Dr. ${doctorId}`));

    // B. Check if Patient is already logged in
    getPatientSession().then((session) => {
      if (session) setUser(session);
      setAuthLoading(false);
    });
  }, [doctorId]);

  // 2. LOGIN HANDLER
  async function handleLogin(formData: FormData) {
    setLoading(true);
    const result = await loginPatient(formData);
    if (result.success && result.patient) {
      setUser(result.patient);
      toast.success(`Welcome back, ${result.patient.name}`);
    } else {
      toast.error(result.error || "Login Failed");
    }
    setLoading(false);
  }

  // 3. GRANT ACCESS HANDLER (Now secure)
  async function handleGrant() {
    if (!user || !doctorId) return;
    setLoading(true);

    // Create FormData manually since we aren't using a form submission anymore
    const formData = new FormData();
    formData.append("nic", user.nic); // Use the secure NIC from session

    const result = await createAccessRequest(formData, doctorId);

    if (result.success) {
        setStatus("waiting"); // Start polling
        toast.success("Request Sent!");
    } else {
        toast.error(result.error);
    }
    setLoading(false);
  }

  // 4. Polling Logic
  useEffect(() => {
    if (status !== "waiting" || !user || !doctorId) return;
    const interval = setInterval(async () => {
      const result = await checkRequestStatus(user.nic, doctorId);
      if (result?.status === "active") {
        setStatus("active");
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast.success("Doctor is Ready!");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, user, doctorId]);

  // --- VIEWS ---

  if (!doctorId) return <div className="p-10 text-center text-red-500">Invalid Link</div>;
  if (authLoading) return <div className="p-10 text-center text-slate-500">Checking security...</div>;

  // VIEW A: LOGIN REQUIRED
  if (!user) {
    return (
      <Card className="w-full max-w-md shadow-xl border-t-4 border-slate-600">
        <CardHeader className="text-center">
            <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-2">
                <Lock className="h-6 w-6 text-slate-700" />
            </div>
            <CardTitle>Login to Prescripto</CardTitle>
            <CardDescription>You must login to grant access to <span className="font-bold">{doctorName}</span></CardDescription>
        </CardHeader>
        <CardContent>
            <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label>NIC Number</Label>
                    <Input name="nic" placeholder="e.g. 199912345678" required />
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input name="password" type="password" placeholder="••••••" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Login & Continue"}
                </Button>
            </form>
        </CardContent>
      </Card>
    );
  }

  // VIEW B: DOCTOR ACCEPTED (Success)
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
          {doctorName} is ready to see you now.
        </p>
        <div className="mt-8 bg-green-700/50 p-4 rounded-lg">
            <p className="text-white text-sm">Please proceed inside.</p>
        </div>
      </Card>
    );
  }

  // VIEW C: GRANT PERMISSION (Logged In)
  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
          <Share2 className="h-6 w-6 text-blue-700" />
        </div>
        <CardTitle className="text-xl">Grant Access?</CardTitle>
        <CardDescription>
          Logged in as <span className="font-bold text-slate-900">{user.name}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 text-center">
            Do you want to share your medical records with <strong>{doctorName}</strong>?
        </div>
        
        {status === "waiting" ? (
             <Button disabled className="w-full h-12 bg-slate-100 text-slate-500 border-2 border-blue-200">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for Doctor...
             </Button>
        ) : (
            <Button onClick={handleGrant} disabled={loading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Grant Access"}
            </Button>
        )}
        
        <p className="text-xs text-center text-slate-400">
            This access is temporary and valid for this consultation only.
        </p>
      </CardContent>
    </Card>
  );
}

export default function GrantAccessPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<p>Loading...</p>}>
        <GrantAccessContent />
      </Suspense>
    </div>
  );
}