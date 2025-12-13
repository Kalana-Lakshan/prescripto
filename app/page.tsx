import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Logo / Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-blue-900">
            Prescripto
          </h1>
          <p className="text-slate-500">
            Secure, Immutable, Digital Prescriptions.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="grid gap-4">
          <Link href="/doctor">
            <Button className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700">
              <Stethoscope className="mr-2 h-6 w-6" />
              Doctor Portal
            </Button>
          </Link>

          {/* We will build this later */}
          <Link href="/pharmacy"> 
            <Button variant="outline" className="w-full h-16 text-lg border-2">
              <Pill className="mr-2 h-6 w-6 text-green-600" />
              Pharmacy Portal
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}