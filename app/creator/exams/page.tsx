"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

enum ExamStatus {
  Draft = 0,
  Published = 1,
  Archived = 2
}

export default function CreatorExamsPage() {
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await fetchApi("/exams");
      setExams(data);
    } catch (e) {
      console.error(e);
    }
  };

  const publishExam = async (examId: string) => {
    try {
        await fetchApi(`/exams/${examId}/publish`, { method: "PATCH" });
        alert("Exam published successfully!");
        loadExams();
    } catch(err: any) {
        alert(err.message || "Failed to publish exam. Have you added valid questions and set a pass mark?");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground">Manage your published workflows and draft exams.</p>
        </div>
        <Link href="/creator/exams/create">
          <Button>Create New Exam</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Bank</CardTitle>
          <CardDescription>A list of all standard exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Pass Mark</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No exams created yet.</TableCell>
                </TableRow>
              ) : (
                exams.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-semibold">{e.title}</TableCell>
                      <TableCell>{e.passMark}</TableCell>
                      <TableCell>{e.durationMinutes ? `${e.durationMinutes} min` : "Infinite"}</TableCell>
                      <TableCell>{e.examQuestions?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === ExamStatus.Published ? "default" : "secondary"}>
                          {e.status === ExamStatus.Published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {e.status === ExamStatus.Draft && (
                           <Button size="sm" onClick={() => publishExam(e.id)} variant="outline">
                             Publish
                           </Button>
                        )}
                        {e.status === ExamStatus.Published && (
                           <Button size="sm" disabled variant="secondary">Active</Button>
                        )}
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
