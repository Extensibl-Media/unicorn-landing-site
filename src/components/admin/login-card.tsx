import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/lib/supabase/browser';

const LoginForm = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const supabase = createClient();

      const { data, error: functionError } = await supabase.functions.invoke('admin-login', {
        body: { email, password }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!data?.session) {
        throw new Error('No session returned from login');
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      if (setSessionError) {
        console.error('Set session error:', setSessionError);
        throw setSessionError;
      }

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      console.log('Session verification:', { user, getUserError });

      if (getUserError || !user) {
        throw new Error('Failed to verify session');
      }

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      let path = '/admin'

      if (redirect) {
        path = `${redirect}`
      }
      window.location.href = path;
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Unicorn Landing Admin</CardTitle>
        <CardDescription className="text-center">
          Please sign in to continue
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Button variant="link" className="text-sm">
              Forgot password?
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full"
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;