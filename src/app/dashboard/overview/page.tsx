'use client';

import { DateTimeWidget } from '@/components/features/dashboard-overview/datetime-widget';
import { WeatherWidget } from '@/components/features/dashboard-overview/weather-widget';
import { NotificationsWidget } from '@/components/features/dashboard-overview/notifications-widget';
import { StatusIndicators } from '@/components/features/dashboard-overview/status-indicators';
import { QuickMenu } from '@/components/features/dashboard-overview/quick-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-0 md:p-0">
      {/* Left Column */}
      <div className="w-full lg:w-1/3 space-y-6">
        <DateTimeWidget />
        <WeatherWidget />
        <NotificationsWidget />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-2/3 space-y-6">
        <StatusIndicators />
        <QuickMenu />
        {/* Placeholder for additional reports or charts if needed in future */}
        {/* 
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Chart placeholder</p>
          </CardContent>
        </Card>
        */}
      </div>
    </div>
  );
}
