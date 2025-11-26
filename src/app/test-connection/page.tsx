import { testSupabaseConnection } from "@/lib/server/test-connection";
import { redirect } from "next/navigation";

/**
 * Test page to verify Supabase connection
 * This is a temporary page for development - remove in production
 */
export default async function TestConnectionPage() {
  const result = await testSupabaseConnection();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">Connection Failed</p>
            <p className="text-red-600">{result.error}</p>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Please check:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your .env.local file exists in the project root</li>
              <li>NEXT_PUBLIC_SUPABASE_URL is set correctly</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly</li>
              <li>You've restarted the dev server after adding env variables</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold mb-2">✓ Connection Successful!</p>
          <p className="text-green-600">{result.message}</p>
          {result.authenticated !== undefined && (
            <p className="text-green-600 mt-2">
              Authentication status: {result.authenticated ? "Authenticated" : "Not authenticated"}
            </p>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Your Supabase connection is working correctly!</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 hover:underline">
              ← Go back to home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

