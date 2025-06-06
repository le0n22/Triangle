
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Server, CheckCircle, XCircle } from 'lucide-react';

export function StatusIndicators() {
  // Placeholder statuses
  const internetOnline = true;
  const serverOnline = true;

  return (
    <Card className="shadow-md bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center justify-end space-x-6">
        <div className="flex items-center text-sm">
          {internetOnline ? <CheckCircle className="w-5 h-5 mr-2 text-accent" /> : <XCircle className="w-5 h-5 mr-2 text-destructive" />}
          Internet: <span className={internetOnline ? "font-semibold text-accent ml-1" : "font-semibold text-destructive ml-1"}>{internetOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="flex items-center text-sm">
          {serverOnline ? <CheckCircle className="w-5 h-5 mr-2 text-accent" /> : <XCircle className="w-5 h-5 mr-2 text-destructive" />}
          Server: <span className={serverOnline ? "font-semibold text-accent ml-1" : "font-semibold text-destructive ml-1"}>{serverOnline ? 'Online' : 'Offline'}</span>
        </div>
        {/* User profile indicator could go here if not in main header */}
      </CardContent>
    </Card>
  );
}
