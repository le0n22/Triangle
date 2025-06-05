import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
  redirect('/dashboard/tables');
  // This page can also be a general dashboard overview if needed in the future.
  return null; 
}
