import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(150, "Username must be less than 150 characters")
      .regex(
        /^[\w.@+-]+$/,
        "Username can only contain letters, digits, and @/./+/-/_"
      ),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirm: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function Signup() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await registerUser(data);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorData = err.response?.data;

      if (errorData) {
        // Handle field-specific errors
        if (errorData.username) {
          setError(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`);
        } else if (errorData.password) {
          setError(`Password: ${errorData.password[0]}`);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <Card className="w-full max-w-md border-white/10 bg-slate-900/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-100">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your information to get started with Agentarium
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                {...register("username")}
                disabled={isLoading}
                className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isLoading}
                className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-slate-200">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  {...register("first_name")}
                  disabled={isLoading}
                  className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-slate-200">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  {...register("last_name")}
                  disabled={isLoading}
                  className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...register("password")}
                disabled={isLoading}
                className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirm" className="text-slate-200">Confirm Password *</Label>
              <Input
                id="password_confirm"
                type="password"
                placeholder="Re-enter your password"
                {...register("password_confirm")}
                disabled={isLoading}
                className="bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
              {errors.password_confirm && (
                <p className="text-sm text-red-500">
                  {errors.password_confirm.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
