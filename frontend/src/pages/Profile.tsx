import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().max(150, "First name is too long").optional(),
  last_name: z.string().max(150, "Last name is too long").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => authAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully!");
      setError("");
    },
    onError: (err: any) => {
      console.error("Profile update error:", err);
      const errorData = err.response?.data;

      if (errorData) {
        if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`);
        } else {
          setError("Failed to update profile. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError("");
    await updateProfileMutation.mutateAsync(data);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 mt-2">Manage your account information</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-slate-100">{user.username}</CardTitle>
                <CardDescription className="text-slate-400">
                  Member since {new Date(user.date_joined).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile Card */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Edit Profile</CardTitle>
            <CardDescription className="text-slate-400">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={user.username}
                  disabled
                  className="bg-slate-800/50 border-white/10 text-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={updateProfileMutation.isPending}
                  className="bg-slate-800/50 border-white/10 text-slate-100"
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
                    {...register("first_name")}
                    disabled={updateProfileMutation.isPending}
                    className="bg-slate-800/50 border-white/10 text-slate-100"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-slate-200">Last Name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    {...register("last_name")}
                    disabled={updateProfileMutation.isPending}
                    className="bg-slate-800/50 border-white/10 text-slate-100"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400">Account ID</span>
              <span className="font-mono text-slate-200">{user.id}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-slate-400">Member Since</span>
              <span className="text-slate-200">{new Date(user.date_joined).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Login</span>
              <span className="text-slate-200">
                {user.last_login
                  ? new Date(user.last_login).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
