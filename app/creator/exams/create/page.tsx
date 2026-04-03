"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

enum ScoringMode {
  EqualMarks = 0,
  CustomMarks = 1
}

export default function CreateExamPage() {
  const router = useRouter();
  
  // Base State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [passMark, setPassMark] = useState<number>(0);
  const [scoringMode, setScoringMode] = useState<ScoringMode>(ScoringMode.EqualMarks);
  const [defaultMark, setDefaultMark] = useState<number>(1);
  const [duration, setDuration] = useState<number | "">("");
  const [maxAttempts, setMaxAttempts] = useState<number | "">("");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  
  // Available questions pool
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [availableVersions, setAvailableVersions] = useState<any[]>([]);

  // Selected questions
  const [selectedQuestions, setSelectedQuestions] = useState<{versionId: string, customMark: number, orderIndex: number, text: string}[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await fetchApi("/questions/my-questions");
      setAllQuestions(data);
      // Filter out ONLY Approved versions into a flattened list for selection
      let approvedPool: any[] = [];
      data.forEach((q: any) => {
         const approvedVer = q.versions?.find((v: any) => v.status === 2); // 2 is Approved status
         if (approvedVer) {
             approvedPool.push({
                 versionId: approvedVer.id,
                 text: approvedVer.text,
                 id: q.id
             });
         }
      });
      setAvailableVersions(approvedPool);
    } catch (e) { }
  };

  const handleSelectQuestion = (versionId: string) => {
     if (selectedQuestions.find(sq => sq.versionId === versionId)) return; // No duplicates allowed
     
     const match = availableVersions.find(av => av.versionId === versionId);
     if (match) {
        setSelectedQuestions(prev => [
            ...prev,
            {
               versionId: match.versionId,
               customMark: 1,
               orderIndex: prev.length,
               text: match.text
            }
        ]);
     }
  };

  const removeQuestion = (versionId: string) => {
      setSelectedQuestions(prev => prev.filter(sq => sq.versionId !== versionId));
  };

  const calculateTotalMarks = () => {
      if (scoringMode === ScoringMode.EqualMarks) {
          return selectedQuestions.length * defaultMark;
      } else {
          return selectedQuestions.reduce((acc, sq) => acc + Number(sq.customMark || 0), 0);
      }
  };

  const handleSave = async () => {
      setErrorMsg("");
      setSaving(true);
      
      const payload = {
          title,
          description,
          instructions,
          passMark: Number(passMark),
          scoringMode: Number(scoringMode),
          defaultQuestionMark: scoringMode === ScoringMode.EqualMarks ? Number(defaultMark) : null,
          durationMinutes: duration ? Number(duration) : null,
          maxAttempts: maxAttempts ? Number(maxAttempts) : null,
          shuffleQuestions,
          shuffleOptions,
          questions: selectedQuestions.map(sq => ({
              questionVersionId: sq.versionId,
              orderIndex: sq.orderIndex,
              customMark: scoringMode === ScoringMode.CustomMarks ? Number(sq.customMark) : null
          }))
      };

      try {
          await fetchApi("/exams", {
              method: "POST",
              body: JSON.stringify(payload)
          });
          alert("Exam saved as Draft!");
          router.push("/creator/exams");
      } catch(err: any) {
          setErrorMsg(err.message || "Failed to save exam check valid entries.");
      } finally {
          setSaving(false);
      }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Builder</h1>
          <p className="text-muted-foreground">Draft your exam and configure dynamic scoring options.</p>
        </div>
      </div>

      {errorMsg && <div className="p-4 bg-destructive/15 text-destructive font-bold border border-destructive/20">{errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
               <CardTitle>Generals & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <Label>Title</Label>
                 <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
               </div>
               <div>
                 <Label>Description</Label>
                 <Input value={description} onChange={(e) => setDescription(e.target.value)} />
               </div>
               
               <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                 <div>
                   <Label>Pass Mark (Req)</Label>
                   <Input type="number" value={passMark} onChange={(e) => setPassMark(Number(e.target.value))} />
                 </div>
                 <div>
                   <Label>Max Attempts (0 = Infinity)</Label>
                   <Input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value ? Number(e.target.value) : "")} />
                 </div>
                 <div>
                   <Label>Duration (Minutes)</Label>
                   <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")} />
                 </div>
               </div>
               
               <div className="border-t pt-4 mt-4">
                   <Label>Scoring Mode</Label>
                   <Select value={scoringMode.toString()} onValueChange={(v) => setScoringMode(Number(v))}>
                     <SelectTrigger>
                        <SelectValue placeholder="Select scoring type..." />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value={ScoringMode.EqualMarks.toString()}>Equal Marks</SelectItem>
                        <SelectItem value={ScoringMode.CustomMarks.toString()}>Custom Marks Per Question</SelectItem>
                     </SelectContent>
                   </Select>
               </div>
               
               {scoringMode === ScoringMode.EqualMarks && (
                   <div>
                     <Label>Default Mark per Question</Label>
                     <Input type="number" value={defaultMark} onChange={(e) => setDefaultMark(Number(e.target.value))} />
                   </div>
               )}
               
               <p className="text-sm font-bold text-primary mt-4">Total Discoverable Points: {calculateTotalMarks()}</p>

            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Pool Content (Approved Questions)</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="h-48 overflow-y-auto border p-2 rounded">
                   {availableVersions.length === 0 ? (
                       <p className="text-muted-foreground text-sm">No approved questions found in your bank.</p>
                   ) : (
                       availableVersions.map(av => (
                           <div key={av.versionId} className="flex justify-between items-center bg-muted/30 p-2 border-b text-sm">
                              <span className="truncate w-3/4">{av.text}</span>
                              <Button size="sm" variant="outline" onClick={() => handleSelectQuestion(av.versionId)}>Add</Button>
                           </div>
                       ))
                   )}
                </div>
             </CardContent>
          </Card>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Selected Layout</CardTitle>
         </CardHeader>
         <CardContent>
             {selectedQuestions.length === 0 ? (
                 <p className="text-sm text-muted-foreground">Please select questions from the pool above.</p>
             ) : (
                 <div className="space-y-2">
                     {selectedQuestions.map((sq, idx) => (
                         <div key={sq.versionId} className="flex gap-4 items-center border p-2 bg-card rounded">
                             <span className="font-bold w-6">{idx + 1}.</span>
                             <span className="flex-1 text-sm truncate">{sq.text}</span>
                             
                             {scoringMode === ScoringMode.CustomMarks && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Mark:</Label>
                                  <Input type="number" className="w-[80px]" value={sq.customMark} onChange={(e) => {
                                      const val = e.target.value;
                                      setSelectedQuestions(prev => prev.map(p => p.versionId === sq.versionId ? {...p, customMark: Number(val)} : p));
                                  }}/>
                                </div>
                             )}
                             
                             <Button size="sm" variant="destructive" onClick={() => removeQuestion(sq.versionId)}>Remove</Button>
                         </div>
                     ))}
                 </div>
             )}
         </CardContent>
         <CardFooter className="flex justify-end pt-4 bg-muted/20">
             <Button onClick={handleSave} disabled={saving || selectedQuestions.length === 0}>
                {saving ? "Saving Draft..." : "Save Draft Exam"}
             </Button>
         </CardFooter>
       </Card>

    </div>
  );
}
