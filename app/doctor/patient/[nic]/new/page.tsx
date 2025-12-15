"use client";

import React, { useState, useEffect, use } from "react";
// UPDATED IMPORT: Added getPatientName
import { savePrescription, getPatientName } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, Pill, ArrowLeft, User, Clock, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function NewPrescriptionPage({ params }: { params: Promise<{ nic: string }> }) {
  const { nic } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorSlmc = searchParams.get("doctor");

  const [saving, setSaving] = useState(false);
  const [patientName, setPatientName] = useState(nic); // Default to NIC initially
  
  // Medicine List State
  const [medList, setMedList] = useState<Medicine[]>([]);
  const [currentMed, setCurrentMed] = useState({ name: "", dosage: "", frequency: "", duration: "" });

  // 1. Fetch Patient Name on Mount
  useEffect(() => {
    async function loadName() {
        const name = await getPatientName(nic);
        setPatientName(name);
    }
    loadName();
  }, [nic]);

  const addMedicine = () => {
    if (!currentMed.name || !currentMed.dosage) {
      toast.error("Please enter Drug Name and Dosage");
      return;
    }
    setMedList([...medList, { ...currentMed, id: Date.now() } as Medicine]);
    setCurrentMed({ name: "", dosage: "", frequency: "", duration: "" });
    document.getElementById("medName")?.focus();
  };

  const removeMedicine = (id: number) => {
    setMedList(medList.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    if (!doctorSlmc) {
        toast.error("Session Error: Doctor ID is missing.");
        return;
    }

    if (medList.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }
    
    setSaving(true);
    const result = await savePrescription(nic, medList, doctorSlmc);
    
    if (result.success) {
      toast.success("Prescription Issued Successfully!");
      router.push(`/doctor/patient/${nic}?doctor=${doctorSlmc}`);
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  if (!doctorSlmc) return <div className="p-10 text-center text-red-500">Missing Doctor ID</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 flex justify-center font-sans">
      <div className="max-w-5xl w-full space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Go Back
                </Button>
                <h1 className="text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                    New Prescription
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" /> for <span className="font-semibold text-blue-700">{patientName}</span>
                </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Doctor ID</p>
                    <p className="font-mono font-medium text-slate-700">{doctorSlmc}</p>
                </div>
            </div>
        </div>

        {/* MAIN INPUT CARD */}
        <Card className="border-0 shadow-xl ring-1 ring-slate-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardHeader className="bg-white pb-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Pill className="h-5 w-5 text-blue-600" /> 
                    Prescribe Medicine
                </CardTitle>
                <CardDescription>Add medicines to the list below.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 p-6 md:p-8">
                
                {/* INPUT ROW */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 space-y-1.5">
                            <Label htmlFor="medName" className="text-slate-600">Drug Name</Label>
                            <Input 
                                id="medName" 
                                placeholder="e.g. Amoxicillin" 
                                className="bg-white border-slate-300 focus:border-blue-500 h-10"
                                value={currentMed.name} 
                                onChange={(e) => setCurrentMed({...currentMed, name: e.target.value})} 
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-slate-600">Dosage</Label>
                            <Input 
                                placeholder="e.g. 500mg" 
                                className="bg-white border-slate-300 focus:border-blue-500 h-10"
                                value={currentMed.dosage} 
                                onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})} 
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-slate-600">Frequency</Label>
                            <Input 
                                placeholder="e.g. TDS" 
                                className="bg-white border-slate-300 focus:border-blue-500 h-10"
                                value={currentMed.frequency} 
                                onChange={(e) => setCurrentMed({...currentMed, frequency: e.target.value})} 
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-slate-600">Duration</Label>
                            <Input 
                                placeholder="e.g. 5 Days" 
                                className="bg-white border-slate-300 focus:border-blue-500 h-10"
                                value={currentMed.duration} 
                                onChange={(e) => setCurrentMed({...currentMed, duration: e.target.value})} 
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Button onClick={addMedicine} size="icon" className="w-full h-10 bg-blue-600 hover:bg-blue-700 shadow-md transition-all">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MEDICINE TABLE */}
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Medicine Name</th>
                                <th className="px-6 py-4">Dosage</th>
                                <th className="px-6 py-4">Frequency</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {medList.map((med) => (
                                <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        {med.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{med.dosage}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border">
                                            {med.frequency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            {med.duration}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => removeMedicine(med.id)} 
                                            className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {medList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Pill className="h-12 w-12 mb-3 opacity-20" />
                            <p>No medicines added yet.</p>
                            <p className="text-xs">Use the form above to add items.</p>
                        </div>
                    )}
                </div>

                {/* ACTION FOOTER */}
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || medList.length === 0} 
                        className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-lg shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5"
                    >
                        {saving ? "Issuing Prescription..." : <><Save className="mr-2 h-5 w-5" /> Issue Prescription</>}
                    </Button>
                </div>

            </CardContent>
        </Card>
      </div>
    </div>
  );
}