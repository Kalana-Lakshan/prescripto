"use client";

import React, { useEffect, useState, use } from "react";
// Import from the parent folder actions
import { getPatientProfile, savePrescription } from "../actions"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, Pill, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the medicine type again
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
  const [saving, setSaving] = useState(false);
  
  // Medicine List State
  const [medList, setMedList] = useState<Medicine[]>([]);
  const [currentMed, setCurrentMed] = useState({ name: "", dosage: "", frequency: "", duration: "" });

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
    if (medList.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }
    setSaving(true);
    const result = await savePrescription(nic, medList);
    
    if (result.success) {
      toast.success("Prescription Issued!");
      // Redirect back to the Profile View
      router.push(`/doctor/patient/${nic}`);
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <Link href={`/doctor/patient/${nic}`}>
                <Button variant="ghost" className="text-slate-500">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Go Back
                </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-800">New Prescription for {nic}</h1>
        </div>

        {/* Writer Form */}
        <Card className="border-t-4 border-blue-600 shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Add Medicines
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="md:col-span-4 space-y-1">
                        <Label>Drug Name</Label>
                        <Input id="medName" placeholder="e.g. Panadol" value={currentMed.name} onChange={(e) => setCurrentMed({...currentMed, name: e.target.value})} />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                        <Label>Dosage</Label>
                        <Input placeholder="500mg" value={currentMed.dosage} onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label>Freq</Label>
                        <Input placeholder="TDS" value={currentMed.frequency} onChange={(e) => setCurrentMed({...currentMed, frequency: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label>Duration</Label>
                        <Input placeholder="3 Days" value={currentMed.duration} onChange={(e) => setCurrentMed({...currentMed, duration: e.target.value})} />
                    </div>
                    <div className="md:col-span-1">
                        <Button onClick={addMedicine} size="icon" className="bg-blue-600 w-full"><Plus className="h-5 w-5" /></Button>
                    </div>
                </div>

                {/* List */}
                <div className="border rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Drug</th>
                                <th className="px-4 py-3">Dosage</th>
                                <th className="px-4 py-3">Freq</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {medList.map((med) => (
                                <tr key={med.id}>
                                    <td className="px-4 py-3 font-medium">{med.name}</td>
                                    <td className="px-4 py-3">{med.dosage}</td>
                                    <td className="px-4 py-3">{med.frequency}</td>
                                    <td className="px-4 py-3">{med.duration}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => removeMedicine(med.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {medList.length === 0 && <p className="text-center text-slate-400 py-6">No items added.</p>}
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving || medList.length === 0} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                    {saving ? "Processing..." : <><Save className="mr-2 h-5 w-5" /> Save & Finish</>}
                </Button>

            </CardContent>
        </Card>
      </div>
    </div>
  );
}