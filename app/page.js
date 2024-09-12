"use client"
import { useSession, signIn, signOut } from 'next-auth/react';
import CalendarDisplay from '@/components/CalendarDisplay';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn('google')}>Sign in with Google</button>
      ) : (
        <div>
          <button onClick={() => signOut()}>Sign out</button>
          <h1>Hello, {session.user.name}</h1>
          <Link href="/calendar" passHref>
            <button>
              Link to Calendar
            </button>
          </Link>
        </div>
      )}
    </div>
  );

}
