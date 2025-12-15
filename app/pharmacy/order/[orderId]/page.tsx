"use client";

import React, { useEffect, useState, use } from "react";
import { getOrderDetails, completeOrder } from "@/app/pharmacy/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, ArrowLeft, User, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrderProcessingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const license = searchParams.get("license"); // Get license for back button

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getOrderDetails(parseInt(orderId));
      setData(result);
    }
    load();
  }, [orderId]);

  async function handleComplete() {
    if (!data?.prescription) return;
    setLoading(true);
    
    const result = await completeOrder(parseInt(orderId), data.prescription.id);
    
    if (result.success) {
        toast.success("Order Marked as Completed");
        router.push(`/pharmacy/dashboard/${license}/queue`);
    } else {
        toast.error("Failed to update order");
    }
    setLoading(false);
  }

  if (!data) return <div className="p-10 text-center">Loading Order...</div>;
  const { queueItem, patient, prescription } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        
        <Link href={`/pharmacy/dashboard/${license}/queue`}>
            <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Queue</Button>
        </Link>

        {/* Header: Patient Info */}
        <Card className="border-t-4 border-orange-500 shadow-md">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><User className="h-8 w-8"/></div>
                    <div>
                        <h1 className="text-2xl font-bold">{patient?.name || queueItem.patientName}</h1>
                        <p className="text-slate-500">NIC: {queueItem.patientNic}</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">Order #{orderId}</Badge>
            </CardHeader>
        </Card>

        {/* Prescription Details */}
        <Card className="shadow-lg">
            <CardHeader className="bg-slate-100 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                    <FileText className="h-5 w-5"/> Prescription Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                
                {!prescription ? (
                    <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">
                        <p className="font-bold">No active prescription found.</p>
                        <p className="text-sm">The patient may not have a recent digital prescription.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center text-sm text-slate-500 border-b pb-4">
                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4"/> Date: {new Date(prescription.createdAt).toLocaleDateString()}</span>
                            <span className="font-bold text-slate-700">{prescription.doctorName}</span>
                        </div>

                        <div className="space-y-3">
                            {prescription.medicines.map((med: any, i: number) => (
                                <div key={i} className="flex justify-between p-3 border rounded bg-slate-50">
                                    <span className="font-bold text-slate-800">{med.name}</span>
                                    <span className="text-slate-600">{med.dosage} ({med.frequency}) - {med.duration}</span>
                                </div>
                            ))}
                        </div>

                        {/* Status Check */}
                        {prescription.status === 'dispensed' && (
                            <div className="bg-green-100 text-green-800 p-3 rounded text-center font-bold">
                                This prescription has already been dispensed.
                            </div>
                        )}
                    </>
                )}

                <Button 
                    onClick={handleComplete} 
                    disabled={loading || !prescription || prescription.status === 'dispensed'} 
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                >
                    {loading ? "Processing..." : <><CheckCircle className="mr-2 h-6 w-6"/> Mark as Dispensed & Complete</>}
                </Button>

            </CardContent>
        </Card>

      </div>
    </div>
  );
}