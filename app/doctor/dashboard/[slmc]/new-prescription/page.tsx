"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { notifyPatientAccess } from "@/app/actions/notifications"; // Import the new action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Search, ArrowLeft, Siren } from "lucide-react"; // Imported Siren icon for emergency
import Link from "next/link";
import { toast } from "sonner";

export default function PatientLookupPage({ params }: { params: Promise<{ slmc: string }> }) {
  const { slmc } = use(params);
  const router = useRouter();
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic.trim()) return;

    setLoading(true);

    // 1. Trigger the Notification
    await notifyPatientAccess(nic.trim(), slmc);
    
    toast.info("Patient has been notified of emergency access.");

    // 2. Redirect to Profile
    router.push(`/doctor/patient/${nic.trim()}?doctor=${slmc}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-red-600">
        <CardHeader>
           <div className="mb-4">
             <Link href={`/doctor/dashboard/${slmc}`}>
                <Button variant="ghost" size="sm" className="-ml-3 text-slate-400 hover:text-slate-700">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
             </Link>
           </div>
           <CardTitle className="text-xl flex items-center gap-2 text-red-700">
              <Siren className="h-6 w-6" /> Emergency Walk-in
           </CardTitle>
           <CardDescription>
              Accessing a patient profile here will send them an immediate security notification.
           </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Enter Patient NIC" 
                        className="pl-10 h-12 text-lg border-red-100 focus:ring-red-500"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        autoFocus
                        required
                    />
                 </div>
              </div>
              <Button disabled={loading} type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-lg">
                 {loading ? "Notifying..." : <><ArrowRight className="mr-2 h-4 w-4" /> Access Profile</>}
              </Button>
           </form>
        </CardContent>
      </Card>
    </div>
  );
}