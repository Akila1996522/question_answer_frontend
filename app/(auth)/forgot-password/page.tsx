"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      // The backend will always return success to prevent email enumeration
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we will send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success ? (
              <div className="p-4 text-sm rounded-md bg-green-50 text-green-700 border border-green-200 flex flex-col items-center gap-2 font-medium text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                <p>If an account with that email exists, a reset link has been sent.</p>
                <p className="text-muted-foreground text-xs mt-2">
                  (Check your backend console for the mock email log during development)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!success && (
              <Button type="submit" className="w-full text-base font-semibold" disabled={loading || !email}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground w-full">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
