"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, Gem } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    // Phone validation (Exactly 11 digits)
    if (formData.phone.length !== 11)
      newErrors.phone = "Phone number must be exactly 11 digits";

    // Password validation (Length + Special Character)
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include a special character (@, #, $, etc.)";
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
      });

      toast.success("Account created! Logging you in...");

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login failed. Please login manually.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to GoldInvest!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
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
          <p className="text-muted-foreground">
            Start your gold investment journey
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join thousands of gold investors</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={formData.phone}
                    onChange={(e) => {
                      // Yahan logic hai: Sirf numbers allow karega aur 11 se upar nahi jane dega
                      const onlyNums = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 11);
                      setFormData({ ...formData, phone: onlyNums });
                    }}
                    required
                    disabled={isLoading}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Include @, #, $, etc."
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError>{errors.password}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="referralCode">
                    Referral Code (Optional)
                  </FieldLabel>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referralCode: e.target.value.toUpperCase(),
                      })
                    }
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
