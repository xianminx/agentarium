import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Bell, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const { user, logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSavePrivacy = () => {
    toast.success("Privacy settings saved!");
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would call an API endpoint to delete the account
    toast.error("Account deletion is not yet implemented");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-100">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Security
          </TabsTrigger>
          <TabsTrigger value="danger" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400">
            <Trash2 className="h-4 w-4 mr-2" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Notification Preferences</CardTitle>
              <CardDescription className="text-slate-400">
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base text-slate-200">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-400">
                    Receive email updates about your agents and tasks
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base text-slate-200">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-slate-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveNotifications}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Security Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor" className="text-base text-slate-200">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-base font-semibold mb-2 text-slate-200">Change Password</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Password changes are coming soon. Contact support if you need to
                  reset your password.
                </p>
                <Button variant="outline" disabled className="border-white/10 text-slate-400">
                  Change Password
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePrivacy}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Active Sessions</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <div>
                    <p className="font-semibold text-slate-100">Current Session</p>
                    <p className="text-sm text-slate-400">
                      Last active: {new Date().toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    className="border-white/10 text-slate-200 hover:bg-slate-800"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-500/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription className="text-slate-400">
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-500/50 p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-500">
                    Delete Account
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Once you delete your account, there is no going back. All your
                    agents, tasks, and data will be permanently deleted.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-slate-100">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently delete
                        your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 text-slate-200 hover:bg-slate-800">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
