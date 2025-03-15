import { useState } from "react";

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
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

interface MigrationData {
  status: string;
  legacy_user: {
    legacy_id: string;
    email: string;
    nickname: string;
    lat: number | null;
    lon: number | null;
  };
  migration_token: string;
}

interface Props {
  migrationData: MigrationData;
}

export function LegacyMigrationForm({ migrationData }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      throw new Error("Passwords must match!");
    }

    const supabase = createBrowserClient();
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: migrationData.legacy_user.email,
        password,
        options: {
          data: {
            legacy_id: migrationData.legacy_user.legacy_id,
          },
        },
      });

      if (authError) {
        console.error("Error creating auth user", {
          error: authError,
          migrationData,
        });
        throw authError;
      }

      // Update migration status
      const { data: migration, error: migrationError } = await supabase
        .from("legacy_migrations")
        .update({
          status: "completed",
          new_user_id: authData.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("migration_token", migrationData.migration_token);

      if (migrationError) {
        console.error("Error handling migration", {
          error: migrationError,
          migrationData,
          authData,
        });
        throw migrationError;
      }

      if (migration && authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            username: migrationData.legacy_user.nickname,
            latitude: migrationData.legacy_user.lat,
            longitude: migrationData.legacy_user.lon,
            approved: true,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Error updating profile after migration", {
            error: profileError,
            migrationData,
            authData,
          });
          throw profileError;
        }
        await supabase.auth.signOut();
      }

      // Show success state
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(`${err}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your account has been migrated. Please open the Unicorn Landing app
            and log in with your email to complete your setup.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back to Unicorn Landing!</CardTitle>
        <CardDescription>
          Set up your new account to claim your existing username
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={migrationData.legacy_user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secure password"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-pink-500 rounded-full"
            disabled={loading}
          >
            {loading ? "Setting up your account..." : "Complete Migration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
