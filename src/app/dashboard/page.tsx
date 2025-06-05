import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
  redirect('/dashboard/overview'); // Changed to redirect to the new overview page
  // This page can also be a general dashboard overview if needed in the future.
  return null; 
}
