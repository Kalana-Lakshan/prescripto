"use client";

import React, { useState, useEffect, use } from "react";
import QRCode from "react-qr-code";
import { getDoctorProfile } from "../actions"; // Import from parent actions
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2 } from "lucide-react";
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
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-6 text-white relative">
      
      {/* Back Button (Top Left) */}
      <div className="absolute top-6 left-6">
        <Link href={`/doctor/dashboard/${slmc}`}>
            <Button variant="outline" className="text-white border-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
        </Link>
      </div>

      <div className="text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500">
        
        <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome to Prescripto</h1>
            <p className="text-blue-200 text-xl">Please scan to join the queue</p>
        </div>

        <Card className="bg-white p-2 w-fit mx-auto border-4 border-blue-400 shadow-2xl">
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