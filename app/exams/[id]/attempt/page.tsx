"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ExamAttemptPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;
    
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    
    // UI states
    const [submitting, setSubmitting] = useState(false);
    const [showingFeedback, setShowingFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState<any>(null);
    const [timerDisplay, setTimerDisplay] = useState<string>("--:--");
    const [fatalError, setFatalError] = useState("");

    // Setup Timer sync
    const timeLeftRef = useRef<number | null>(null);

    useEffect(() => {
        // Try starting the exam initially. If attempt limit hit etc it will blow up
        startAttempt();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timeLeftRef.current !== null && timeLeftRef.current > 0) {
                timeLeftRef.current -= 1;
                const m = Math.floor(timeLeftRef.current / 60).toString().padStart(2, '0');
                const s = Math.floor(timeLeftRef.current % 60).toString().padStart(2, '0');
                setTimerDisplay(`${m}:${s}`);
                
                if (timeLeftRef.current <= 0) {
                     handleTimeOut();
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const startAttempt = async () => {
        try {
            // First we trigger start to get the ID
            const res = await fetchApi("/examengine/start", {
                method: "POST",
                body: JSON.stringify({ examId })
            });
            setAttemptId(res.attemptId);
            fetchStatus(res.attemptId);
        } catch (err: any) {
             setFatalError(err.message || "Failed to start exam.");
        }
    };

    const fetchStatus = async (aId: string) => {
        try {
            const data = await fetchApi(`/examengine/${aId}/status`);
            
            // If the status is not InProgress anymore (TimedOut or Submitted), push to results
            if (data.status !== 0) {
                router.push(`/exams/${examId}/result/${aId}`);
                return;
            }

            setStatusData(data);
            if (data.remainingSeconds !== null) {
                timeLeftRef.current = data.remainingSeconds;
            }
            setSelectedOptions([]);
            setShowingFeedback(false);
            setFeedbackData(null);
            setSubmitting(false);

            if (!data.currentQuestion && data.unansweredCount === 0) {
                 // Exam is done
                 finishExam(aId);
            }
        } catch (err: any) {
             setFatalError(err.message);
        }
    };

    const handleTimeOut = async () => {
        if (!attemptId) return;
        setFatalError("Time is up! Auto-submitting...");
        await finishExam(attemptId);
    };

    const toggleOption = (optId: string, isMulti: boolean) => {
        if (showingFeedback) return; // Block changes after submit

        if (!isMulti) {
            setSelectedOptions([optId]);
            return;
        }

        if (selectedOptions.includes(optId)) {
            setSelectedOptions(prev => prev.filter(p => p !== optId));
        } else {
            setSelectedOptions(prev => [...prev, optId]);
        }
    };

    const submitAnswer = async () => {
        if (!attemptId || !statusData?.currentQuestion) return;
        if (selectedOptions.length === 0) {
            alert("Please select an answer first.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetchApi(`/examengine/${attemptId}/submit-answer`, {
                method: "POST",
                body: JSON.stringify({
                    attemptQuestionId: statusData.currentQuestion.id,
                    selectedOptionIds: selectedOptions
                })
            });

            // Res contains feedback
            setFeedbackData(res);
            setShowingFeedback(true);
        } catch (e: any) {
            alert(e.message || "Failed to submit answer.");
        } finally {
            setSubmitting(false);
        }
    };

    const finishExam = async (aId: string) => {
        try {
             await fetchApi(`/examengine/${aId}/finish`, { method: "POST" });
             router.push(`/exams/${examId}/result/${aId}`);
        } catch(e) {}
    };

    const nextQuestion = () => {
        if (!attemptId) return;
        fetchStatus(attemptId); // fetches next unanswered strictly
    };

    if (fatalError) {
        return (
            <div className="container mx-auto p-6 flex justify-center py-20">
                <Card className="w-full max-w-lg text-center p-6 bg-destructive/10 text-destructive border-destructive">
                    <h2 className="text-xl font-bold mb-2">Notice</h2>
                    <p>{fatalError}</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>Leave</Button>
                </Card>
            </div>
        );
    }

    if (!statusData || !statusData.currentQuestion) {
        return <div className="p-10 text-center animate-pulse">Loading attempt...</div>;
    }

    const { currentQuestion, answeredCount, totalQuestions, remainingSeconds } = statusData;
    const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
    const isMultiChoice = currentQuestion.type === 2;

    return (
        <div className="container mx-auto p-4 max-w-3xl space-y-4">
           {/* Top Stats Bar */}
           <div className="flex justify-between items-center bg-card p-4 rounded border shadow-sm">
               <div className="flex gap-4 items-center">
                   <div className="text-sm font-bold">Progress: {answeredCount}/{totalQuestions}</div>
                   <div className="w-32 h-2 bg-muted rounded overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }}></div>
                   </div>
               </div>
               
               {remainingSeconds !== null && (
                   <div className="text-lg font-mono font-bold bg-muted px-4 py-1 rounded text-red-600">
                       ⏱ {timerDisplay}
                   </div>
               )}
           </div>

           {/* Current Question View */}
           <Card className="shadow-lg border-primary/20">
               <CardHeader>
                   <CardTitle className="flex justify-between items-center text-lg">
                       <span>Question {currentQuestion.order}</span>
                       <Badge variant="outline">{isMultiChoice ? "Multiple Choice" : "Single Choice"}</Badge>
                   </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                   <div className="text-lg font-medium whitespace-pre-wrap">{currentQuestion.text}</div>
                   
                   <div className="space-y-3 mt-6">
                       {currentQuestion.options.map((opt: any) => {
                           const isSelected = selectedOptions.includes(opt.id);
                           let styleClass = isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/50" : "hover:bg-muted cursor-pointer";
                           
                           // If feedback mode, lock interactions
                           if (showingFeedback && isSelected) {
                               styleClass = feedbackData?.wasCorrect 
                                  ? "border-green-500 bg-green-50 ring-2 ring-green-500 text-green-900" 
                                  : "border-red-500 bg-red-50 ring-2 ring-red-500 text-red-900";
                           }

                           return (
                               <div 
                                 key={opt.id} 
                                 onClick={() => toggleOption(opt.id, isMultiChoice)}
                                 className={`p-4 border rounded transition-all duration-200 flex items-start gap-4 ${styleClass}`}
                               >
                                  <div className="flex-none font-bold text-muted-foreground pt-0.5">{opt.key})</div>
                                  <div className="flex-1">{opt.text}</div>
                               </div>
                           );
                       })}
                   </div>

                   {/* Feedback Pane */}
                   {showingFeedback && feedbackData && (
                       <div className={`p-4 rounded border mt-6 ${feedbackData.wasCorrect ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"}`}>
                           <h4 className={`font-bold text-lg mb-2 ${feedbackData.wasCorrect ? "text-green-700" : "text-red-700"}`}>
                               {feedbackData.wasCorrect ? "Correct! ✅" : "Incorrect ❌"}
                           </h4>
                           {feedbackData.explanation && (
                               <div className="text-sm border-t pt-2 mt-2 opacity-80">
                                   <strong>Explanation:</strong> {feedbackData.explanation}
                               </div>
                           )}
                       </div>
                   )}
               </CardContent>
               <CardFooter className="bg-muted/30 flex justify-between p-4 border-t">
                  {!showingFeedback ? (
                      <>
                        <Button variant="ghost" onClick={() => finishExam(attemptId!)}>Abandon Exam</Button>
                        <Button onClick={submitAnswer} disabled={submitting || selectedOptions.length === 0}>
                            {submitting ? "Checking..." : "Submit Answer"}
                        </Button>
                      </>
                  ) : (
                      <>
                        <div></div>
                        <Button onClick={nextQuestion} size="lg" className="w-1/3">Next Question ➔</Button>
                      </>
                  )}
               </CardFooter>
           </Card>
        </div>
    );
}
