"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- 1. Import useRouter
import { registerDoctor } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function DoctorRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // <--- 2. Initialize Router

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    // Optional: Password Check
    const password = formData.get("password") as string;
    if (password.length < 6) {
      toast.error("Password too weak");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerDoctor(formData);

      if (result?.success && result.slmcNumber) {
        // <--- 3. SUCCESS: Manually Redirect Here
        toast.success("Account Created!");
        router.push(`/doctor/dashboard/${result.slmcNumber}`);
      } else {
        // <--- 4. FAILURE: Show Error
        toast.error("Registration Failed", {
          description: result?.error || "Unknown error",
        });
        setIsLoading(false); // Stop loading only if we stay on page
      }
    } catch (err) {
      toast.error("Connection Error");
      setIsLoading(false);
    }
  }

  // ... (The rest of your JSX remains exactly the same) ...
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-800">
         {/* ... card content ... */}
         <CardContent>
          {/* Note: We still use action={handleSubmit} */}
          <form action={handleSubmit} className="space-y-4">
             {/* ... inputs ... */}
             
             {/* ... KEEP YOUR EXISTING INPUTS HERE ... */}
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Dr. Kasun Perera" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slmc">SLMC Number</Label>
                <Input id="slmc" name="slmcNumber" placeholder="12345" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" placeholder="e.g. Cardiologist" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Hospital Email</Label>
                <Input id="email" name="email" type="email" placeholder="doctor@hospital.lk" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

             <Button 
              type="submit" 
              className="w-full bg-blue-800 hover:bg-blue-900 text-lg py-6 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registering...
                </>
              ) : (
                "Register & Get QR Code"
              )}
            </Button>
            
             <div className="text-center text-sm text-slate-500 mt-4">
              Already registered?{" "}
              <Link href="/login" className="text-blue-700 hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </form>
         </CardContent>
      </Card>
    </div>
  );
}