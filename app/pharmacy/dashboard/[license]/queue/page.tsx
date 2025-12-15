"use client";

import React, { useEffect, useState, use } from "react";
import { getPharmacyQueue } from "./actions"; // Now returns { active, history }
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCcw, Clock, CheckCircle, User, Calendar } from "lucide-react";
import Link from "next/link";

export default function PharmacyQueuePage({ params }: { params: Promise<{ license: string }> }) {
  const { license } = use(params);
  
  // State for both lists
  const [data, setData] = useState<{ active: any[], history: any[] }>({ active: [], history: [] });
  const [loading, setLoading] = useState(true);

  // Load Data
  async function loadData() {
    setLoading(true);
    // Fetch both active and history in one go
    const result = await getPharmacyQueue(license);
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [license]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Link href={`/pharmacy/dashboard/${license}`}>
                <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pharmacy Operations</h1>
              <p className="text-slate-500 text-sm">Manage orders and view records</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* TABS SYSTEM */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-white p-1 rounded-lg border h-auto">
            <TabsTrigger value="active" className="px-6 py-2">
               Active Queue ({data.active.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="px-6 py-2">
               Order History
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ACTIVE QUEUE */}
          <TabsContent value="active" className="mt-6 space-y-4">
             {data.active.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <p className="text-slate-400">No pending orders in the queue.</p>
                </div>
             ) : (
                <div className="grid gap-4">
                  {data.active.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 font-bold">
                                #{order.id}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{order.patientName}</h3>
                                <p className="text-sm text-slate-500">NIC: {order.patientNic}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                   <Clock className="h-3 w-3" /> Arrived: {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <Link href={`/pharmacy/dashboard/${license}/order/${order.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">Process Order</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             )}
          </TabsContent>

          {/* TAB 2: ORDER HISTORY (Completed) */}
          <TabsContent value="history" className="mt-6">
             <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Prescribed By</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.history.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No history available yet.</td>
                                    </tr>
                                ) : (
                                    data.history.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 bg-white">
                                            
                                            {/* UPDATED: Date & Time Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        {new Date(order.updatedAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-slate-900">{order.patientName}</span>
                                                    <span className="text-slate-400 text-xs">({order.patientNic})</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {order.doctorName || "Unknown Doctor"}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200">
                                                    <CheckCircle className="h-3 w-3" /> Dispensed
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}