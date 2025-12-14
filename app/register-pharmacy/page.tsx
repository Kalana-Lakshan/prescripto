"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerPharmacy } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Pill } from "lucide-react";

export default function PharmacyRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const result = await registerPharmacy(formData);

    if (result.success) {
      toast.success("Pharmacy Registered!");
      // Redirect to Login (we will build this next)
      router.push("/pharmacy/login"); 
    } else {
      toast.error("Registration Failed", {
        description: result.error,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-amber-500">
        <CardHeader className="text-center">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-2">
             <Pill className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-slate-800">Pharmacy Registration</CardTitle>
          <CardDescription>Join the Prescripto Network</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Pharmacy Name</Label>
              <Input name="name" placeholder="City Care Pharmacy" required />
            </div>

            <div className="space-y-2">
              <Label>License Number (Reg No)</Label>
              <Input name="licenseNumber" placeholder="PH-2025-001" required />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" placeholder="No 123, Main Street..." required />
            </div>

            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input name="phone" placeholder="011-2345678" required />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input name="password" type="password" required />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register Pharmacy"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}