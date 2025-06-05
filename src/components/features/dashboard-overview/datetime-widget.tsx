
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CalendarDays } from 'lucide-react';

export function DateTimeWidget() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this runs once on mount for initial set, and then cleans up interval

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">Current Date & Time</h2>
        </div>
        <div className="text-center">
          {currentTime ? (
            <>
              <div className="flex items-center justify-center text-5xl font-bold mb-2">
                <Clock className="w-10 h-10 mr-3 text-primary" />
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="flex items-center justify-center text-lg text-muted-foreground">
                <CalendarDays className="w-5 h-5 mr-2" />
                {format(currentTime, 'eeee, dd MMMM yyyy')}
              </div>
            </>
          ) : (
            // Placeholder or loading state until client-side hydration
            <div className="flex items-center justify-center text-5xl font-bold mb-2 h-[40px]"> 
              {/* Keep space to avoid layout shift */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
