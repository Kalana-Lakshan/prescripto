"use client";

import React, { useState, useEffect, use } from "react";
import QRCode from "react-qr-code";
import { getPharmacyProfile } from "@/app/pharmacy/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function PharmacyQRPage({ params }: { params: Promise<{ license: string }> }) {
  const { license } = use(params);
  const [pharmacyName, setPharmacyName] = useState("Loading...");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // 1. Get the current domain (e.g., https://prescripto.com)
    setBaseUrl(window.location.origin);

    // 2. Fetch Pharmacy Name
    async function load() {
      const data = await getPharmacyProfile(license);
      if (data) setPharmacyName(data.name);
    }
    load();
  }, [license]);

  // 3. Generate the URL (Like Doctor's QR)
  // When scanned, this opens the patient check-in page for this pharmacy
  const qrData = `${baseUrl}/pharmacy/check-in?license=${license}`;

  return (
    <div className="min-h-screen bg-teal-950 print:bg-white flex flex-col items-center justify-center p-6 text-white print:text-black relative">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 print:hidden">
        <Link href={`/pharmacy/dashboard/${license}`}>
            <Button className="bg-teal-100 text-teal-900 hover:bg-white hover:text-teal-950 font-semibold shadow-md border-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
        </Link>
      </div>

      {/* Print Button */}
      <div className="absolute top-6 right-6 print:hidden">
        <Button 
            onClick={() => window.print()} 
            className="bg-teal-600 hover:bg-teal-500 text-white shadow-md"
        >
            <Printer className="mr-2 h-4 w-4" /> Print QR
        </Button>
      </div>

      <div className="text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500 w-full">
        
        <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome to Prescripto</h1>
            <p className="text-teal-200 text-xl print:text-slate-600">Scan to join the order queue</p>
        </div>

        {/* QR Card */}
        <Card className="bg-white p-2 w-fit mx-auto border-4 border-teal-500 shadow-2xl print:shadow-none print:border-black">
            <CardContent className="p-4 flex flex-col items-center">
                
                {/* QR Code Container */}
                <div 
                    className="bg-white p-2"
                    style={{ width: "280px", height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                   {/* Only render QR when baseUrl is ready to avoid hydration errors */}
                   {baseUrl && (
                    <QRCode 
                        value={qrData} 
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                   )}
                </div>

            </CardContent>
        </Card>

        {/* Pharmacy Details */}
        <div className="space-y-1">
            <h2 className="text-3xl font-bold">{pharmacyName}</h2>
            <p className="text-lg opacity-80 font-mono">LICENSE: {license}</p>
        </div>

      </div>
    </div>
  );
}