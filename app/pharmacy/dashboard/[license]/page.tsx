"use client";

import React, { useEffect, useState, use } from "react";
import { getPharmacyProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, QrCode, LogOut } from "lucide-react";
import Link from "next/link";

export default function PharmacyDashboard({ params }: { params: Promise<{ license: string }> }) {
  const { license } = use(params);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getPharmacyProfile(license);
      setProfile(data);
    }
    load();
  }, [license]);

  if (!profile) return <div className="p-10 text-center">Loading Pharmacy...</div>;

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Pill className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{profile.name}</h1>
              <p className="text-xs text-slate-500">Lic: {profile.licenseNumber}</p>
            </div>
          </div>
          <Link href="/">
             <Button variant="ghost" size="sm" className="text-slate-500">
               <LogOut className="h-4 w-4 mr-2" /> Logout
             </Button>
          </Link>
        </header>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action 1: Scan QR */}
          <Card className="hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500">
            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="bg-blue-100 p-6 rounded-full">
                <QrCode className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Dispense Medicine</h2>
                <p className="text-slate-500 text-sm mt-1">
                   Scan patient QR to view prescription
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Open Scanner</Button>
            </CardContent>
          </Card>

          {/* Action 2: History (Placeholder) */}
          <Card className="hover:shadow-lg transition border-l-4 border-slate-300">
             <CardHeader>
               <CardTitle>Recent Dispensing</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-slate-400 text-sm text-center py-8">
                 No recent activity found.
               </p>
             </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}