"use client";

import React, { useEffect, useState, use } from "react";
// ↓↓↓ UPDATED IMPORT: Use local actions where the fix is applied ↓↓↓
import { getOrderDetails, processOrder } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Pill, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProcessOrderPage({ params }: { params: Promise<{ license: string; id: string }> }) {
  const { license, id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 1. Load Order Details
  useEffect(() => {
    async function load() {
      // Fetch data using the fixed query (fetches specific prescription by ID)
      const data = await getOrderDetails(parseInt(id));
      
      if (!data) {
        toast.error("Order not found");
        router.push(`/pharmacy/dashboard/${license}/queue`);
        return;
      }
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [id, license, router]);

  // 2. Handle Dispense
  const handleDispense = async () => {
    setProcessing(true);
    
    // Call the server action to mark as dispensed
    // We pass the queueID, prescriptionID, and License
    const result = await processOrder(parseInt(id), order.prescriptionId, license);
    
    if (result.success) {
      toast.success("Order completed successfully!");
      router.push(`/pharmacy/dashboard/${license}/queue`); // Go back to queue
    } else {
      toast.error("Failed to complete order.");
    }
    setProcessing(false);
  };

  if (loading) return <div className="p-10 text-center">Loading Order Details...</div>;
  if (!order) return null;

  // Check if ALREADY dispensed (Safe check based on DB status)
  const isDispensed = order.status === "completed" || order.prescriptionStatus === "dispensed";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link href={`/pharmacy/dashboard/${license}/queue`}>
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Process Order #{id}</h1>
            <p className="text-slate-500 text-sm">Review details and dispense medicine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: PATIENT INFO */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                   <User className="h-5 w-5" /> Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Name</label>
                    <p className="font-medium text-lg text-slate-800">{order.patientName}</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">NIC Number</label>
                    <p className="font-medium text-slate-700 font-mono">{order.patientNic}</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Age</label>
                    <p className="font-medium text-slate-700">{order.age || "N/A"}</p>
                 </div>
                 
                 {/* Allergies Warning */}
                 {order.allergies && order.allergies.length > 0 ? (
                   <div className="bg-red-50 p-3 rounded-md border border-red-100">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
                        <AlertTriangle className="h-4 w-4" /> Allergies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {order.allergies.map((alg: string, i: number) => (
                           <Badge key={i} variant="destructive" className="text-xs">
                             {alg}
                           </Badge>
                        ))}
                      </div>
                   </div>
                 ) : (
                    <div className="bg-green-50 p-3 rounded-md border border-green-100 flex items-center gap-2 text-green-700 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" /> No Known Allergies
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: PRESCRIPTION */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
               <CardHeader className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Prescription Details</CardTitle>
                        <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                           <Calendar className="h-4 w-4" /> 
                           Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900">{order.doctorName}</p>
                        <p className="text-xs text-slate-500">Prescribed By</p>
                    </div>
                  </div>
               </CardHeader>

               <CardContent className="p-6 flex-1 space-y-6">
                  {/* Medicines List */}
                  <div className="space-y-4">
                     {Array.isArray(order.medicines) && order.medicines.map((med: any, index: number) => (
                        <div key={index} className="flex justify-between items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                           <div className="flex items-start gap-3">
                              <div className="bg-white p-2 rounded-full border shadow-sm text-green-600 mt-1">
                                 <Pill className="h-5 w-5" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-lg text-slate-800">{med.name}</h4>
                                 {med.duration && (
                                     <p className="text-sm text-slate-500">Duration: {med.duration}</p>
                                 )}
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="block font-bold text-slate-700 text-lg">{med.dosage}</span>
                              <span className="text-sm text-slate-500 bg-white px-2 py-0.5 rounded border font-medium">
                                {med.frequency}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>

               {/* Footer Action */}
               <div className="p-6 bg-slate-50 border-t mt-auto">
                 {isDispensed ? (
                    <div className="w-full bg-green-100 text-green-800 border border-green-200 h-12 flex items-center justify-center rounded-md font-bold text-lg">
                       <CheckCircle className="mr-2 h-5 w-5" /> This prescription has already been dispensed.
                    </div>
                 ) : (
                    <Button 
                        onClick={handleDispense} 
                        disabled={processing} 
                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-200"
                    >
                       {processing ? (
                           <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> 
                       ) : (
                           <><CheckCircle className="mr-2 h-5 w-5" /> Mark as Dispensed & Complete</>
                       )}
                    </Button>
                 )}
               </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}