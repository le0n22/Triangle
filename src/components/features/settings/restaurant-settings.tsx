
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function RestaurantSettings() {
  const [restaurantName, setRestaurantName] = useState('OrderFlow Restaurant');
  const [logoUrl, setLogoUrl] = useState('https://placehold.co/150x50.png?text=OrderFlow'); // Default or current logo
  const { toast } = useToast();

  const handleSaveChanges = () => {
    console.log('Saving restaurant settings:', { restaurantName, logoUrl });
    // In a real app, this would call an API to save the settings.
    // For now, we'll just update local state and show a toast.
    toast({
      title: 'Settings Saved',
      description: 'Restaurant details have been updated locally.',
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Restaurant Details</CardTitle>
        <CardDescription>Manage your restaurant's name and logo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name</Label>
          <Input
            id="restaurantName"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Your Restaurant's Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/your-logo.png"
          />
          {logoUrl && (
            <div className="mt-4 p-4 border border-border rounded-md bg-muted/50 flex justify-center items-center">
              <Image 
                src={logoUrl} 
                alt="Restaurant Logo Preview" 
                width={150} 
                height={50} 
                style={{ objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/150x50.png?text=Error'; }}
                data-ai-hint="logo business" 
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} className="w-full sm:w-auto ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
