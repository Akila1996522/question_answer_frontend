"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Matches C# enum
enum QuestionVersionStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Rejected = 3,
  Archived = 4
}

const statusTextMap: Record<number, string> = {
  [QuestionVersionStatus.Draft]: "Draft",
  [QuestionVersionStatus.PendingApproval]: "Pending Approval",
  [QuestionVersionStatus.Approved]: "Approved",
  [QuestionVersionStatus.Rejected]: "Rejected",
  [QuestionVersionStatus.Archived]: "Archived"
};

export default function CreatorQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await fetchApi("/questions/my-questions");
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Questions</h1>
          <p className="text-muted-foreground">Manage your questions and view approval statuses.</p>
        </div>
        <Link href="/creator/questions/create">
          <Button>Create or Import Question</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>A list of all identity containers and their latest versions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question ID</TableHead>
                <TableHead>Latest Text</TableHead>
                <TableHead>Versions Count</TableHead>
                <TableHead>Latest Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No questions created yet.</TableCell>
                </TableRow>
              ) : (
                questions.map((q) => {
                  const latestVersion = q.versions?.sort((a: any, b: any) => b.versionNumber - a.versionNumber)[0] || {};
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">{q.id.split('-')[0]}</TableCell>
                      <TableCell className="max-w-md truncate">{latestVersion.text}</TableCell>
                      <TableCell>{q.versions?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={latestVersion.status === QuestionVersionStatus.Approved ? "default" : "secondary"}>
                          {statusTextMap[latestVersion.status] || "Unknown"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
