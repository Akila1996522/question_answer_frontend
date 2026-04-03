"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function CreateImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Direct fetch bypasses fetchApi because of FormData boundary
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch("http://localhost:5000/api/questions/preview-import", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setParsedData(data);
    } catch (e: any) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const saveImports = async () => {
    setSaving(true);
    try {
      for (const q of parsedData) {
        if (!q.isValid) continue; // Skip invalid questions
        await fetchApi("/questions/draft", {
          method: "POST",
          body: JSON.stringify(q)
        });
      }
      alert("Successfully saved ALL valid drafts. Pending Admin approval.");
      router.push("/creator/questions");
    } catch(e) {
      alert("Failed to save some questions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Questions</h1>
          <p className="text-muted-foreground">Upload a DOCX template to auto-parse standard format questions.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>Select your Word Document (.docx) file.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input 
            type="file" 
            accept=".docx" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="w-1/3"
          />
          <Button disabled={!file || loading} onClick={handleUpload}>
            {loading ? "Parsing..." : "Preview Import"}
          </Button>
        </CardContent>
        {uploadError && <div className="p-4 text-red-500 font-semibold">{uploadError}</div>}
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Output Preview</CardTitle>
            <CardDescription>Review the output logic before committing to your Question Bank.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {parsedData.map((q, idx) => (
                  <div key={idx} className={`p-4 border rounded shadow-sm ${!q.isValid ? "border-red-400 bg-red-50" : "bg-card"}`}>
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Question {q.questionNumber}</span>
                        <div className="space-x-2">
                          <Badge variant={q.isValid ? "default" : "destructive"}>{q.isValid ? "Valid" : "Needs Review"}</Badge>
                          <Badge variant="outline">{q.type === 1 ? "Single Choice" : "Multiple Choice"}</Badge>
                        </div>
                     </div>
                     <p className="mb-4 text-sm">{q.text}</p>
                     <ul className="mb-4 space-y-1 text-sm">
                       {q.options?.map((o: any) => (
                          <li key={o.key} className={`flex items-center gap-2 ${o.isCorrect ? "font-bold text-green-600" : ""}`}>
                            <span className="w-5 h-5 rounded flex items-center justify-center bg-muted text-xs">{o.key}</span>
                            {o.text}
                            {o.isCorrect && <span>✓ Correct</span>}
                          </li>
                       ))}
                     </ul>
                     {q.explanation && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                     )}
                     
                     {q.warnings && q.warnings.length > 0 && (
                        <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                          {q.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                        </ul>
                     )}
                  </div>
               ))}
             </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4 mt-6">
             <Button variant="outline" onClick={() => setParsedData([])}>Clear</Button>
             <Button onClick={saveImports} disabled={saving || parsedData.filter(i => i.isValid).length === 0}>
                {saving ? "Saving..." : `Submit ${parsedData.filter(i => i.isValid).length} Valid Questions`}
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
