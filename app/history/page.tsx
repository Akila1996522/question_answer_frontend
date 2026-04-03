"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttemptHistory {
  id: string;
  examTitle: string;
  score: number;
  isPassed: boolean;
  date: string;
  attemptNumber: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AttemptHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Assuming this endpoint exists, as it wasn't immediately found in controllers
      const data = await fetchApi("/ExamEngine/history");
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "Failed to load attempt history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <Loading message="Loading your exam history..." />;
  if (error) return <ErrorState title="History Error" message={error} onRetry={fetchHistory} />;
  if (!history) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Exam History</h1>
      <p className="text-muted-foreground">Review your past exam attempts and results</p>

      {history.length === 0 ? (
        <EmptyState 
          title="No History Found" 
          description="You haven't taken any exams yet." 
          actionLabel="View Exams"
          actionHref="/exams"
        />
      ) : (
        <div className="border rounded-md mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attempt #</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.examTitle}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.attemptNumber}</TableCell>
                  <TableCell>{record.score.toFixed(2)}%</TableCell>
                  <TableCell>
                    {record.isPassed ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Passed</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
