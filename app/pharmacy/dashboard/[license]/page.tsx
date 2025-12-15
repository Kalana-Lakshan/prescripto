"use client";

import React, { useEffect, useState, use } from "react";
import { getPharmacyProfile } from "@/app/pharmacy/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, QrCode, User, MapPin, Hash, Phone } from "lucide-react";
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

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-7xl w-full space-y-6">
        
        {/* 1. TOP HEADER (Matches "Welcome, Dr..." style) */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {profile.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Online
              </span>
              <span className="text-slate-500 text-sm">Dashboard Overview</span>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50 gap-2 mt-4 md:mt-0">
              <LogOut className="h-4 w-4"/> Sign Out
            </Button>
          </Link>
        </div>

        {/* 2. THREE-COLUMN DASHBOARD GRID */}
        {/* We use h-[500px] to give the cards that tall, distinct look from the image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[500px]">
            
            {/* COLUMN 1: MY PROFILE (Blue Border) */}
            <Card className="border-2 border-blue-600 shadow-md h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-blue-700 flex items-center gap-2 text-xl">
                        <User className="h-5 w-5" /> My Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4 flex-1">
                    
                    {/* License Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pharmacy License</label>
                        <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 text-slate-700 font-medium">
                            <Hash className="h-5 w-5 text-blue-500" />
                            {profile.licenseNumber}
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                        <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 text-slate-700 font-medium">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            {profile.address}
                        </div>
                    </div>

                    {/* Phone Field (if exists) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</label>
                        <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 text-slate-700 font-medium">
                            <Phone className="h-5 w-5 text-blue-500" />
                            {profile.phone || "No phone listed"}
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* COLUMN 2: ORDER QUEUE (Green Border) */}
            <Link href={`/pharmacy/dashboard/${license}/queue`} className="group h-full">
                <Card className="border-2 border-green-500 shadow-md h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-green-100 p-6 rounded-full group-hover:bg-green-600 transition-colors mb-6">
                        <ClipboardList className="h-12 w-12 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Queue</h3>
                    <p className="text-slate-500 max-w-[200px]">
                        Manage live prescription orders and dispense medicines.
                    </p>
                </Card>
            </Link>

            {/* COLUMN 3: QR CODE (Purple Border) */}
            <Link href={`/pharmacy/dashboard/${license}/qr`} className="group h-full">
                <Card className="border-2 border-purple-500 shadow-md h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-purple-100 p-6 rounded-full group-hover:bg-purple-600 transition-colors mb-6">
                        <QrCode className="h-12 w-12 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Show QR Code</h3>
                    <p className="text-slate-500 max-w-[200px]">
                        Display this code for patients to scan and check in.
                    </p>
                </Card>
            </Link>

        </div>
      </div>
    </div>
  );
}