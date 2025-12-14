import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stethoscope, User, Pill } from "lucide-react"; // Added 'Pill' icon

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Prescripto</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          The unified digital health ecosystem connecting Doctors, Patients, and Pharmacies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* 1. DOCTOR PORTAL (Blue) */}
        <Card className="hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-800 transform hover:-translate-y-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
              <Stethoscope className="h-8 w-8 text-blue-800" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Doctor Portal</CardTitle>
            <CardDescription>Manage patients & issue prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Link href="/login" className="w-full">
              <Button className="w-full bg-blue-800 hover:bg-blue-900 h-12 text-lg shadow-blue-200 shadow-lg">
                Doctor Login
              </Button>
            </Link>
            <Link href="/register-doctor" className="w-full block">
              <Button variant="ghost" className="w-full text-slate-600 hover:text-blue-800 hover:bg-blue-50">
                Register New Doctor
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 2. PATIENT PORTAL (Green) */}
        <Card className="hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600 transform hover:-translate-y-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
              <User className="h-8 w-8 text-green-700" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Patient Portal</CardTitle>
            <CardDescription>Access records & view history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Link href="/patient/login" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-green-200 shadow-lg">
                Patient Login
              </Button>
            </Link>
            <Link href="/register" className="w-full block">
              <Button variant="ghost" className="w-full text-slate-600 hover:text-green-700 hover:bg-green-50">
                Register New Patient
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. PHARMACY PORTAL (Orange/Amber) */}
        <Card className="hover:shadow-2xl transition-all duration-300 border-t-4 border-amber-500 transform hover:-translate-y-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-amber-100 p-4 rounded-full w-fit mb-4">
              <Pill className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Pharmacy Portal</CardTitle>
            <CardDescription>Dispense medicine & track orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {/* Note: We will need to create these routes later */}
            <Link href="/pharmacy/login" className="w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 h-12 text-lg shadow-amber-200 shadow-lg">
                Pharmacy Login
              </Button>
            </Link>
            <Link href="/register-pharmacy" className="w-full block">
              <Button variant="ghost" className="w-full text-slate-600 hover:text-amber-600 hover:bg-amber-50">
                Register New Pharmacy
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
      
      <footer className="mt-16 text-slate-400 text-sm font-medium">
        &copy; 2025 Prescripto Health Systems. Secure & Encrypted.
      </footer>
    </div>
  );
}