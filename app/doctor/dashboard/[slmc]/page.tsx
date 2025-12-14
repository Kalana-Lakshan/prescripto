"use client";

import React, { useEffect, useState, use } from "react";
import { getDoctorProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Building2, User, QrCode, Users, LogOut, Mail, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DoctorProfilePage({ params }: { params: Promise<{ slmc: string }> }) {
  const { slmc } = use(params);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getDoctorProfile(slmc);
      setProfile(data);
    }
    load();
  }, [slmc]);

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-500">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome, {profile.name}</h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">ONLINE</span>
                    Dashboard Overview
                </p>
            </div>
            <Link href="/">
                <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
            </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LEFT: Profile Summary (Takes 1 Column) */}
            <Card className="lg:col-span-1 shadow-md h-fit border-t-4 border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                        <User className="h-5 w-5 text-blue-600" /> My Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Specialization</p>
                        <div className="flex items-center gap-3 font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Stethoscope className="h-5 w-5 text-blue-500" /> 
                            {profile.specialization || "Not Provided"}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hospital</p>
                        <div className="flex items-center gap-3 font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Building2 className="h-5 w-5 text-blue-500" /> 
                            {profile.hospital || "Not Provided"}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">SLMC Reg. No</p>
                        <div className="flex items-center gap-3 font-mono text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-sm font-bold bg-slate-200 px-2 rounded">ID</span>
                            {profile.slmcNumber}
                        </div>
                    </div>

                     {profile.email && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Email</p>
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 truncate">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {profile.email}
                            </div>
                        </div>
                     )}

                </CardContent>
            </Card>

            {/* RIGHT: Action Buttons (Takes 3 Columns & Uses a Grid) */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. NEW PRESCRIPTION (For Walk-ins) */}
                <Link href={`/doctor/dashboard/${slmc}/new-prescription`}>
                    <Card className="h-full hover:shadow-xl transition-all border-t-4 border-blue-600 cursor-pointer group hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full space-y-4">
                            <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-600 transition-colors">
                                <PlusCircle className="h-8 w-8 text-blue-700 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Emergency Walk-ins</h3>
                                <p className="text-sm text-slate-500 mt-1">Manual entry for walk-in patients.</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* 2. WAITING ROOM (For Queue) */}
                <Link href={`/doctor/dashboard/${slmc}/waiting-room`}>
                    <Card className="h-full hover:shadow-xl transition-all border-t-4 border-green-600 cursor-pointer group hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full space-y-4">
                            <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-600 transition-colors">
                                <Users className="h-8 w-8 text-green-700 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Waiting Room</h3>
                                <p className="text-sm text-slate-500 mt-1">Manage live queue and accept patients.</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* 3. SHOW QR (For Display) */}
                <Link href={`/doctor/dashboard/${slmc}/qr`}>
                    <Card className="h-full hover:shadow-xl transition-all border-t-4 border-purple-600 cursor-pointer group hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full space-y-4">
                            <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-600 transition-colors">
                                <QrCode className="h-8 w-8 text-purple-700 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Show QR Code</h3>
                                <p className="text-sm text-slate-500 mt-1">Display scan code on external monitor.</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

            </div>
        </div>

      </div>
    </div>
  );
}