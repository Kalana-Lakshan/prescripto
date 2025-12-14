"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginDoctor } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Stethoscope, ArrowRight } from "lucide-react";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const result = await loginDoctor(formData);

    if (result.success && result.slmc) {
      toast.success("Welcome back, Doctor!");
      // Redirect to the Dashboard we built earlier
      router.push(`/doctor/dashboard/${result.slmc}`);
    } else {
      toast.error("Login Failed", {
        description: result.error,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-800">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
             <Stethoscope className="h-6 w-6 text-blue-800" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Doctor Login</CardTitle>
          <CardDescription>Access your clinical dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                placeholder="doctor@hospital.com" 
                className="h-11"
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-blue-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                className="h-11"
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-800 hover:bg-blue-900 h-11 text-lg mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">New to Prescripto?</span>
              </div>
            </div>

            <Link href="/register-doctor" className="w-full block">
              <Button variant="outline" className="w-full text-slate-600 border-slate-300">
                Register as a New Doctor
              </Button>
            </Link>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}