"use client";

import React, { useState, useEffect, use } from "react";
import QRCode from "react-qr-code";
import { getDoctorProfile } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react"; // Import Printer icon
import Link from "next/link";

export default function DoctorQRDisplayPage({ params }: { params: Promise<{ slmc: string }> }) {
  const { slmc } = use(params);
  const [baseUrl, setBaseUrl] = useState("");
  const [doctorName, setDoctorName] = useState("Loading...");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    async function load() {
      const doc = await getDoctorProfile(slmc);
      if (doc) setDoctorName(doc.name);
    }
    load();
  }, [slmc]);

  const qrData = `${baseUrl}/access/grant?doctor=${slmc}`;

  return (
    // Added print:bg-white and print:text-black to ensure the paper printout is clean
    <div className="min-h-screen bg-blue-950 print:bg-white flex flex-col items-center justify-center p-6 text-white print:text-black relative">
      
      {/* Back Button - Light Color & Hidden on Print */}
      <div className="absolute top-6 left-6 print:hidden">
        <Link href={`/doctor/dashboard/${slmc}`}>
            <Button className="bg-blue-100 text-blue-900 hover:bg-white hover:text-blue-950 font-semibold shadow-md border-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
        </Link>
      </div>

      {/* Print Button - Hidden on Print */}
      <div className="absolute top-6 right-6 print:hidden">
        <Button 
            onClick={() => window.print()} 
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-md"
        >
            <Printer className="mr-2 h-4 w-4" /> Print QR
        </Button>
      </div>

      <div className="text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500">
        
        <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome to Prescripto</h1>
            <p className="text-blue-200 text-xl print:text-slate-600">Please scan to join the queue</p>
        </div>

        <Card className="bg-white p-2 w-fit mx-auto border-4 border-blue-400 shadow-2xl print:shadow-none print:border-black">
            <CardContent className="p-4">
                 {baseUrl && <QRCode value={qrData} size={300} />}
            </CardContent>
        </Card>

        <div className="space-y-1">
            <h2 className="text-3xl font-bold">{doctorName}</h2>
            <p className="text-lg opacity-80 font-mono">SLMC: {slmc}</p>
        </div>

      </div>
    </div>
  );
}