"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createAccessRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Share2, CheckCircle2 } from "lucide-react";

function GrantAccessContent() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctor"); // Reads the SLMC from the QR link
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleRequest(formData: FormData) {
    if (!doctorId) {
      toast.error("Invalid QR Code (Missing Doctor ID)");
      return;
    }
    
    setLoading(true);

    const result = await createAccessRequest(formData, doctorId);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Request Sent!");
    } else {
      toast.error("Failed", { description: result.error });
    }
    setLoading(false);
  }

  // 1. Success View (After joining queue)
  if (isSuccess) {
    return (
      <Card className="w-full max-w-sm text-center p-8 bg-green-50 border-2 border-green-100 shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-green-800">You are in the Queue!</h2>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
          Please wait. Dr. <strong>{doctorId}</strong> has been notified and will call you shortly.
        </p>
      </Card>
    );
  }

  // 2. Error View (If scanned wrong QR)
  if (!doctorId) {
    return (
      <Card className="w-full max-w-sm p-6 bg-red-50 text-red-800 text-center">
        <h2 className="font-bold">Invalid QR Code</h2>
        <p className="text-sm">Please scan the doctor's code again.</p>
      </Card>
    );
  }

  // 3. Normal View (Form)
  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
          <Share2 className="h-6 w-6 text-blue-700" />
        </div>
        <CardTitle className="text-xl text-slate-800">Share Medical Access</CardTitle>
        <CardDescription>
          You are granting temporary access to <br />
          <span className="font-bold text-slate-900">Dr. {doctorId}</span>
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

          <p className="text-xs text-center text-slate-400 mt-4">
            By clicking Grant Access, you allow this doctor to view your medical history for this session only.
          </p>

        </form>
      </CardContent>
    </Card>
  );
}

// Wrapper needed for Next.js Suspense boundary
export default function GrantAccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<p className="text-slate-500">Loading secure link...</p>}>
        <GrantAccessContent />
      </Suspense>
    </div>
  );
}