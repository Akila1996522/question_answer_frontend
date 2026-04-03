"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { FileQuestion, FolderGit2, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExamPerformance {
  examTitle: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  averageScore: number;
}

interface CreatorStats {
  myQuestionsCount: number;
  myExamsCount: number;
  totalAttemptsOnMyExams: number;
  examPerformances: ExamPerformance[];
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/Analytics/creator");
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load creator statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading message="Loading your dashboard..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={fetchStats} />;
  if (!stats) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
      <p className="text-muted-foreground">Your content and performance statistics</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myQuestionsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Exams</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myExamsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts (My Exams)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttemptsOnMyExams}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Exam Performances</h2>
        {stats.examPerformances.length === 0 ? (
          <EmptyState 
            title="No Exam Data" 
            description="You don't have any exams with attempt data yet." 
          />
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Total Attempts</TableHead>
                  <TableHead>Pass Count</TableHead>
                  <TableHead>Fail Count</TableHead>
                  <TableHead>Avg. Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.examPerformances.map((perf, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{perf.examTitle}</TableCell>
                    <TableCell>{perf.totalAttempts}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">{perf.passCount}</TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">{perf.failCount}</TableCell>
                    <TableCell>{perf.averageScore.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
