
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, ShoppingCart, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockNotifications = [
  { id: 1, type: 'order', message: 'New online order #ORD789 received.', timestamp: new Date(Date.now() - 5 * 60 * 1000), icon: ShoppingCart, iconColor: 'text-accent' },
  { id: 2, type: 'system', message: 'Table 5 marked as "dirty".', timestamp: new Date(Date.now() - 15 * 60 * 1000), icon: AlertTriangle, iconColor: 'text-primary' }, // Changed yellow to primary
  { id: 3, type: 'info', message: 'KDS printer connection restored.', timestamp: new Date(Date.now() - 30 * 60 * 1000), icon: Info, iconColor: 'text-primary' }, // Changed blue to primary
  { id: 4, type: 'order', message: 'Order #ORD456 ready for pickup.', timestamp: new Date(Date.now() - 45 * 60 * 1000), icon: ShoppingCart, iconColor: 'text-accent' },
];

export function NotificationsWidget() {
  return (
    <Card className="shadow-lg bg-card text-card-foreground h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <Bell className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        {mockNotifications.length > 0 ? (
          <ScrollArea className="flex-grow pr-2 -mr-2"> 
            <ul className="space-y-3">
              {mockNotifications.map(notif => {
                const IconComponent = notif.icon;
                return (
                  <li key={notif.id} className="flex items-start p-3 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors">
                    <IconComponent className={`w-5 h-5 mr-3 mt-0.5 shrink-0 ${notif.iconColor}`} />
                    <div className="flex-grow">
                      <p className="text-sm text-card-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(notif.timestamp, { addSuffix: true })}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">No new notifications.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
