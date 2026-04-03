"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminQuestionsApprovalPage() {
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const data = await fetchApi("/questions/pending-approvals");
      setApprovals(data);
    } catch (e) {}
  };

  const handleAction = async (versionId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await fetchApi(`/questions/approve/${versionId}`, { method: "PATCH" });
      } else {
        await fetchApi(`/questions/reject/${versionId}`, { 
          method: "PATCH", 
          body: JSON.stringify("Rejected by Admin") 
        });
      }
      setApprovals(prev => prev.filter(v => v.id !== versionId));
    } catch (e) {
      alert("Action failed.");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Question Approvals</h1>
        <p className="text-muted-foreground">Review pending questions submitted by creators.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Explanation</TableHead>
                <TableHead>Creator ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No pending approvals.</TableCell>
                </TableRow>
              ) : (
                approvals.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-xs truncate font-medium">{v.text}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{v.explanation || "N/A"}</TableCell>
                    <TableCell className="font-mono text-xs">{v.question?.originalCreator?.firstName} {v.question?.originalCreator?.lastName}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button size="sm" onClick={() => handleAction(v.id, "approve")} className="bg-green-600 hover:bg-green-700">Approve</Button>
                       <Button size="sm" variant="destructive" onClick={() => handleAction(v.id, "reject")}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
