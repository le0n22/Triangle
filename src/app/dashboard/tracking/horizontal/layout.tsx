
import type { ReactNode } from 'react';

export default function HorizontalTrackingPageLayout({ children }: { children: ReactNode }) {
  // This layout simply renders its children, allowing the page component
  // to control the full screen layout itself without interference from
  // the main DashboardLayout (header, sidebar padding etc.).
  return <>{children}</>;
}
