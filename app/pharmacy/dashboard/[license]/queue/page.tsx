"use client";

import React, { useEffect, useState, use } from "react";
// ↓↓↓ FIXED IMPORT: Now points to the local file ↓↓↓
import { getPharmacyQueue, getCompletedOrders } from "./actions"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCcw, Clock, CheckCircle, User } from "lucide-react";
import Link from "next/link";

export default function PharmacyQueuePage({ params }: { params: Promise<{ license: string }> }) {
  const { license } = use(params);
  
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  async function loadData() {
    setLoading(true);
    // 1. Fetch Active
    const active = await getPharmacyQueue(license);
    setActiveOrders(active);

    // 2. Fetch History
    const history = await getCompletedOrders(license);
    setHistoryOrders(history);
    
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [license]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="active">Active Queue ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>

          {/* TAB 1: ACTIVE QUEUE */}
          <TabsContent value="active" className="mt-6 space-y-4">
             {activeOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <p className="text-slate-400">No pending orders in the queue.</p>
                </div>
             ) : (
                <div className="grid gap-4">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 font-bold">
                                #{order.id}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{order.patientName}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
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
                            <tbody className="divide-y">
                                {historyOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No history available yet.</td>
                                    </tr>
                                ) : (
                                    historyOrders.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "N/A"}</span>
                                                    <span className="text-xs text-slate-500">{item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : ""}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    {item.patientName}
                                                    <span className="text-xs text-slate-400">({item.patientNic})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {item.doctorName || "Unknown Doctor"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
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