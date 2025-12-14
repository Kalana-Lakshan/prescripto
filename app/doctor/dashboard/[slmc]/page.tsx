"use client";

import React, { useEffect, useState, use } from "react";
import { getDoctorProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Building2, User, QrCode, Users, LogOut, Mail } from "lucide-react";
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
      
      <div className="max-w-5xl w-full space-y-8">
        
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT: Profile Summary */}
            <Card className="md:col-span-1 shadow-md h-fit border-t-4 border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                        <User className="h-5 w-5 text-blue-600" /> My Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    {/* Specialization with Fallback */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Specialization</p>
                        <div className="flex items-center gap-3 font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Stethoscope className="h-5 w-5 text-blue-500" /> 
                            {profile.specialization || "Not Provided"}
                        </div>
                    </div>

                    {/* Hospital with Fallback */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hospital</p>
                        <div className="flex items-center gap-3 font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Building2 className="h-5 w-5 text-blue-500" /> 
                            {profile.hospital || "Not Provided"}
                        </div>
                    </div>

                    {/* SLMC Number */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">SLMC Reg. No</p>
                        <div className="flex items-center gap-3 font-mono text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-sm font-bold bg-slate-200 px-2 rounded">ID</span>
                            {profile.slmcNumber}
                        </div>
                    </div>

                     {/* Email (Optional Addition) */}
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

            {/* RIGHT: Action Buttons */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Button 1: QR Display */}
                <Card className="hover:shadow-xl transition-all border-l-4 border-blue-600 cursor-pointer group hover:-translate-y-1 duration-200">
                    <Link href={`/doctor/dashboard/${slmc}/qr`}>
                        <CardContent className="flex items-center p-8 gap-6">
                            <div className="bg-blue-100 p-5 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                                <QrCode className="h-10 w-10 text-blue-700 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Show QR Code</h3>
                                <p className="text-slate-500 mt-1">
                                    Open the large QR display for the external monitor. Patients scan this to check in.
                                </p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                {/* Button 2: Manage Queue */}
                <Card className="hover:shadow-xl transition-all border-l-4 border-green-600 cursor-pointer group hover:-translate-y-1 duration-200">
                    <Link href={`/doctor/dashboard/${slmc}/waiting-room`}>
                        <CardContent className="flex items-center p-8 gap-6">
                            <div className="bg-green-100 p-5 rounded-full group-hover:bg-green-600 transition-colors duration-300">
                                <Users className="h-10 w-10 text-green-700 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">Manage Waiting Room</h3>
                                <p className="text-slate-500 mt-1">
                                    View the live patient queue, accept appointments, and open patient medical records.
                                </p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

            </div>
        </div>

      </div>
    </div>
  );
}