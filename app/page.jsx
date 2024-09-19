"use client";
import { useSession, signIn, signOut } from 'next-auth/react';
import CalendarDisplay from '@/components/CalendarDisplay';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md px-8 py-12 bg-white rounded-lg shadow-md">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-950">
          AI Scheduling Assistant
        </h1>
        {!session ? (
          <button
            onClick={() => signIn('google')}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Google
          </button>
        ) : (
          <div>
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign out
            </button>
            <h3 className="mt-4 text-xl font-medium text-center text-black bg-blue-400">
              Hello, {session.user.name}
            </h3>
            <Link
              href="/calendar"
              className="block w-full px-4 py-2 mt-8 text-white bg-green-500 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Link to Calendar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
