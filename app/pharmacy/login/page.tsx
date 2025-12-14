"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPharmacy } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Pill, ArrowRight } from "lucide-react";

export default function PharmacyLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const result = await loginPharmacy(formData);

    if (result.success && result.license) {
      toast.success("Login Successful");
      router.push(`/pharmacy/dashboard/${result.license}`);
    } else {
      toast.error("Login Failed", {
        description: result.error,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-amber-500">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-2">
             <Pill className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Pharmacy Login</CardTitle>
          <CardDescription>Access the dispensing portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input name="licenseNumber" placeholder="PH-2025-001" required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input name="password" type="password" required className="h-11" />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 h-11 text-lg mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center mt-4">
              <Link href="/register-pharmacy" className="text-sm text-amber-600 hover:underline">
                Register New Pharmacy
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}