"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPatient } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export default function PatientLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    const result = await loginPatient(formData);

    if (result.success && result.nic) {
      toast.success("Welcome back!");
      router.push(`/patient/dashboard/${result.nic}`);
    } else {
      toast.error("Login Failed", {
        description: result.error || "Please check your credentials.",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-slate-800">Patient Sign In</CardTitle>
          <CardDescription>Access your secure medical dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="nic">NIC Number</Label>
              <Input 
                id="nic" 
                name="nic" 
                placeholder="198512345678" 
                className="h-11"
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-green-600 hover:underline">
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
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-lg"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">New to Prescripto?</span>
              </div>
            </div>

            <Link href="/register" className="w-full block">
              <Button variant="outline" className="w-full text-slate-600 border-slate-300">
                Register New Account
              </Button>
            </Link>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}