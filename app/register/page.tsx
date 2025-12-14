"use client";

import { registerPatient } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 

export default function RegisterPage() {
  
  const handleSubmit = async (formData: FormData) => {
    // Basic Client-side validation could go here
    toast.info("Registering...");
    
    // Call the Server Action
    await registerPatient(formData);
    
    // Note: If successful, the action will redirect us.
    // If it fails (e.g., duplicate NIC), we might want to handle that here 
    // but for the prototype, the simple redirect is enough.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-xl">Patient Registration</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            
            {/* NIC Number */}
            <div className="space-y-2">
              <Label htmlFor="nic">NIC Number (National ID)</Label>
              <Input id="nic" name="nic" placeholder="198512345678" required />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Saman Perera" required />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Phone</Label>
              <Input id="phone" name="phone" placeholder="077-1234567" required />
            </div>
            
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="No 10, Colombo Rd..." />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg mt-4">
              Register Patient
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}