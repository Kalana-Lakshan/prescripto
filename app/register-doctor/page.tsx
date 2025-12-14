"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerDoctor } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Stethoscope, Building2, Mail } from "lucide-react";

export default function RegisterDoctorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const result = await registerDoctor(formData);

    if (result.success) {
      toast.success("Doctor Registration Successful");
      router.push("/login");
    } else {
      toast.error("Registration Failed", {
        description: result.error,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-blue-800">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
             <Stethoscope className="h-6 w-6 text-blue-800" />
          </div>
          <CardTitle className="text-xl">Doctor Registration</CardTitle>
          <CardDescription>Join the Prescripto Medical Network</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            
            {/* Personal Details */}
            <div className="space-y-2">
              <Label>Doctor's Full Name</Label>
              <Input name="name" placeholder="Dr. Kasun Perera" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>SLMC Number</Label>
                    <Input name="slmc" placeholder="12345" required />
                </div>
                <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Input name="specialization" placeholder="Cardiologist" required />
                </div>
            </div>

            {/* Hospital Name Field */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" /> 
                    Hospital / Clinic Name
                </Label>
                <Input name="hospital" placeholder="National Hospital of Sri Lanka" required />
                <p className="text-xs text-slate-400">Enter your primary place of work.</p>
            </div>

            {/* Doctor's Email Field */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Doctor's Email Address
              </Label>
              <Input name="email" type="email" placeholder="doctor@example.com" required />
              <p className="text-xs text-slate-400">This will be used for your login.</p>
            </div>

            <div className="space-y-2">
              <Label>Create Password</Label>
              <Input name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 mt-4 h-11 text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Register Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}