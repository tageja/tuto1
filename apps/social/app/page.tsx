import { redirect } from 'next/navigation';

/**
 * Root page — community-first front door.
 * Everyone (signed in or guest) lands on the public feed; guests can browse and
 * are prompted to sign in only when they try to interact.
 */
export default function RootPage() {
  redirect('/feed');
}
