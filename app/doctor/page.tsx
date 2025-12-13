"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; 
import { createPrescription } from "./actions"; // <--- ADD THIS

// Types for our Medicine Entry
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

export default function DoctorDashboard() {
  const patient = {
    name: "Saman Perera",
    nic: "198500100123",
    age: 42,
    bloodType: "O+",
    allergies: ["Penicillin", "Dust"],
  };

  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: "", dosage: "", frequency: "", duration: "" },
  ]);

  const addRow = () => {
    setMedicines([
      ...medicines,
      { id: Date.now(), name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const updateRow = (id: number, field: keyof Medicine, value: string) => {
    setMedicines(
      medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const removeRow = (id: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((med) => med.id !== id));
    } else {
      toast.warning("Prescription must have at least one medicine.");
    }
  };

  const handlePrescribe = async () => {
    // 1. Validation
    const isValid = medicines.every((m) => m.name && m.dosage);
    if (!isValid) {
      toast.error("Incomplete Prescription", {
        description: "Please fill in Medicine Name and Dosage for all rows.",
      });
      return;
    }

    try {
      // 2. Prepare the data for the Server Action
      const formData = new FormData();
      formData.append("patient_id", patient.nic); // Assuming you link via NIC
      
      // Since 'medicines' is an array, we usually stringify it to send via FormData
      // Make sure your Server Action parses this JSON!
      formData.append("medicines", JSON.stringify(medicines));

      // 3. CALL THE SERVER ACTION
      // This is the line that was missing!
      console.log("Triggering Server Action..."); // Look for this in Browser Console
      await createPrescription(formData);

      // 4. Success Handling
      toast.success("Prescription Issued Successfully", {
        description: `Saved to Database for ${patient.name}`,
      });

      // Optional: Clear form
      // setMedicines([{ id: Date.now(), name: "", dosage: "", frequency: "", duration: "" }]);

    } catch (error) {
      console.error(error);
      toast.error("Failed to save prescription");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <div className="flex gap-2 text-sm text-slate-500">
                <span>NIC: {patient.nic}</span>
                <span>•</span>
                <span>Age: {patient.age}</span>
                <span>•</span>
                <span className="font-bold text-red-500">Blood: {patient.bloodType}</span>
              </div>
            </div>
          </div>
          
          {patient.allergies.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-md border border-red-200">
              <AlertCircle size={20} />
              <span className="font-medium">Allergic to: {patient.allergies.join(", ")}</span>
            </div>
          )}
        </div>

        {/* PRESCRIPTION PAD */}
        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Prescription</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Active Session: 12:40 Remaining
            </Badge>
          </CardHeader>
          <CardContent>
            
            <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-sm text-slate-500 px-2">
              <div className="col-span-4">Medicine Name</div>
              <div className="col-span-2">Dosage (mg)</div>
              <div className="col-span-2">Frequency</div>
              <div className="col-span-3">Duration / Qty</div>
              <div className="col-span-1"></div>
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div key={med.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <Input 
                      placeholder="e.g. Paracetamol" 
                      value={med.name}
                      onChange={(e) => updateRow(med.id, "name", e.target.value)}
                      autoFocus={index === medicines.length - 1} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      placeholder="500mg" 
                      value={med.dosage}
                      onChange={(e) => updateRow(med.id, "dosage", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      placeholder="tds / 3x" 
                      value={med.frequency}
                      onChange={(e) => updateRow(med.id, "frequency", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      placeholder="5 days" 
                      value={med.duration}
                      onChange={(e) => updateRow(med.id, "duration", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => removeRow(med.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="outline" onClick={addRow} className="border-dashed border-slate-400">
                <Plus size={16} className="mr-2" /> Add Medicine
              </Button>

              <div className="flex gap-3">
                <Button variant="ghost">Cancel</Button>
                <Button 
                  onClick={handlePrescribe} 
                  className="bg-blue-700 hover:bg-blue-800 text-white min-w-[150px]"
                >
                  <Save size={16} className="mr-2" /> Issue Prescription
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}