import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard/tables');
  return null; // Or a loading spinner, but redirect is usually fast
}
