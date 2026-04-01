"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Gem, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.sendOtp(email);
      toast.success("A 6-digit code has been sent to your email.");
      setStep(2); // Move to OTP step
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP Only
  const handleVerifyOtpOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success("OTP Verified! Now set your new password.");
      setStep(3);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid or expired OTP.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Password validation (Length + Special Char)
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be 8+ chars and include a special character.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordWithOtp(email, otp, newPassword);
      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">
              GoldInvest
            </span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 1 && "Reset Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "New Password"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to receive a 6-digit code."}
              {step === 2 && `We sent a code to ${email}`}
              {step === 3 && "Create a secure new password."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} id="form-step-1">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>
              </form>
            )}

            {/* STEP 2: OTP (✅ FIXED THIS PART) */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtpOnly} id="form-step-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="otp">6-Digit OTP Code</FieldLabel>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="text-center text-xl tracking-widest"
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>
              </form>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
              <form onSubmit={handleVerifyOtpAndReset} id="form-step-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Include @, #, $, etc."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {step === 1 && (
              <Button
                type="submit"
                form="form-step-1"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                Send Code
              </Button>
            )}
            {step === 2 && (
              <Button
                type="submit"
                form="form-step-2"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                Verify Code
              </Button>
            )}
            {step === 3 && (
              <Button
                type="submit"
                form="form-step-3"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                Reset Password
              </Button>
            )}

            <p className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
