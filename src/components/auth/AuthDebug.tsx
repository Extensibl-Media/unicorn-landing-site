import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const parseAndLog = async () => {
      // Get the full URL
      const fullUrl = window.location.href;
      console.log("Full URL:", fullUrl);

      // Parse query parameters
      const queryParams = new URLSearchParams(window.location.search);
      console.log("Query params:", Object.fromEntries(queryParams));

      const supabase = createClient();
      try {
        // If we have a code in the hash, try to exchange it
        const code = queryParams.get("code");
        if (code) {
          console.log("Found code:", code);
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          console.log("Session data:", data);
        }

        // Get current session if any
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("Current session:", user);

        // Compile debug info
        setDebugInfo({
          url: fullUrl,
          query: Object.fromEntries(queryParams),
          code: code || null,
          hasSession: !!user,
        });
      } catch (err) {
        console.error("Error:", err);
        setError(`${err}`);
      }
    };

    parseAndLog();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Auth Debug Information</CardTitle>
        <CardDescription>
          Examining the redirect structure from Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <div className="text-red-500 mb-4">Error: {error}</div> : null}

        {debugInfo ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">URL:</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {debugInfo.url}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Hash Parameters:</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.hash, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Query Parameters:</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.query, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Auth Code:</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {debugInfo.code}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Session Status:</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {debugInfo.hasSession ? "Active" : "None"}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}
