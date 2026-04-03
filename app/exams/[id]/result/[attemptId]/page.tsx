"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ResultPage() {
   const params = useParams();
   const { id, attemptId } = params;

   return (
      <div className="container mx-auto p-6 flex justify-center py-20">
         <Card className="w-full max-w-lg text-center">
             <CardHeader>
                 <CardTitle className="text-3xl">Exam Completed</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <p className="text-lg">Your attempt has been successfully finalized natively inside the backend engine.</p>
                 <Badge variant="default" className="text-lg py-1 px-4">Score Recorded</Badge>
             </CardContent>
             <CardFooter className="flex justify-center">
                 <Button onClick={() => window.location.href = "/"}>Return Home</Button>
             </CardFooter>
         </Card>
      </div>
   );
}
