"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerPatient } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    const result = await registerPatient(formData);
    
    if (result?.success) {
      toast.success("Registration Successful!");
      const nic = formData.get("nic") as string;
      router.push(`/patient/dashboard/${nic}`);
    } else {
      toast.error("Registration Failed", {
        description: result?.error || "User might already exist.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-xl">Patient Registration</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            
            {/* Required Fields */}
            <div className="space-y-2">
              <Label htmlFor="nic">NIC Number <span className="text-red-500">*</span></Label>
              <Input id="nic" name="nic" placeholder="198512345678" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" placeholder="Saman Perera" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Phone <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" placeholder="077-1234567" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
              <Input id="address" name="address" placeholder="No 10, Colombo Rd..." required />
            </div>

            {/* NEW: Optional Medical Fields */}
            <div className="pt-2 border-t mt-4">
                <p className="text-sm font-bold text-slate-500 mb-3">Medical Details (Optional)</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        {/* Note: No 'required' attribute here */}
                        <Input id="bloodType" name="bloodType" placeholder="O+" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" name="age" type="number" placeholder="30" />
                    </div>
                </div>

                <div className="space-y-2 mt-3">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input id="allergies" name="allergies" placeholder="e.g. Penicillin, Peanuts (Separate by comma)" />
                </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register Patient"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}