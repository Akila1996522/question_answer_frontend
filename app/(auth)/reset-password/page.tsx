"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
    
    if (!emailParam || !tokenParam) {
      setError("Invalid reset link. Missing required parameters.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !token) {
      setError("Invalid reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please ensure your token isn't expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
          <CardDescription>
            Please enter and confirm your new strong password.
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
              <p>Your password has been reset successfully!</p>
              <p className="mt-2 text-sm text-green-800">You may now sign in using your new credentials.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !email || !token}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || !email || !token}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!success ? (
            <Button type="submit" className="w-full text-base font-semibold" disabled={loading || !email || !token || !password || !confirmPassword}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          ) : (
            <Button type="button" className="w-full text-base font-semibold" onClick={() => router.push("/login")}>
              Go to Sign In
            </Button>
          )}
          
          <p className="text-center text-sm text-muted-foreground w-full">
            Back to{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-xl flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Validating link payload...</p>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
