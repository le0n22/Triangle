
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/types';

export function RestaurantSettings() {
  const [restaurantName, setRestaurantName] = useState('OrderFlow Restaurant');
  const [logoUrl, setLogoUrl] = useState('https://placehold.co/150x50.png?text=OrderFlow');
  const [printServerUrl, setPrintServerUrl] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const PRINT_SERVER_URL_KEY = 'orderflow-print-server-url';

  useEffect(() => {
    const savedUrl = localStorage.getItem(PRINT_SERVER_URL_KEY);
    if (savedUrl) {
      setPrintServerUrl(savedUrl);
    } else {
      const defaultUrl = 'http://localhost:3001/print-kot';
      setPrintServerUrl(defaultUrl);
    }
  }, []);

  const handleSaveRestaurantDetails = () => {
    console.log('Saving restaurant settings:', { restaurantName, logoUrl });
    toast({
      title: t('settingsSaved' as TranslationKey),
      description: t('restaurantDetailsUpdated' as TranslationKey),
    });
  };

  const handleSavePrintServerUrl = () => {
    localStorage.setItem(PRINT_SERVER_URL_KEY, printServerUrl);
    toast({
      title: t('settingsSaved' as TranslationKey),
      description: t('printServerUrlUpdated' as TranslationKey),
    });
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">{t('restaurantDetails' as TranslationKey)}</CardTitle>
          <CardDescription>{t('manageRestaurantNameLogo' as TranslationKey)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="restaurantName">{t('restaurantName' as TranslationKey)}</Label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder={t('yourRestaurantNamePlaceholder' as TranslationKey)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">{t('logoUrl' as TranslationKey)}</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder={t('logoUrlPlaceholder' as TranslationKey)}
            />
            {logoUrl && (
              <div className="mt-4 p-4 border border-border rounded-md bg-muted/50 flex justify-center items-center">
                <Image
                  src={logoUrl}
                  alt={t('restaurantLogoPreviewAlt' as TranslationKey)}
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
          <Button onClick={handleSaveRestaurantDetails} className="w-full sm:w-auto ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('saveChanges' as TranslationKey)}
          </Button>
        </CardFooter>
      </Card>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">{t('localPrintServerSettings' as TranslationKey)}</CardTitle>
          <CardDescription>{t('configurePrintServerUrl' as TranslationKey)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="printServerUrl">{t('printServerURL' as TranslationKey)}</Label>
            <Input
              id="printServerUrl"
              value={printServerUrl}
              onChange={(e) => setPrintServerUrl(e.target.value)}
              placeholder="e.g., http://localhost:3001/print-kot"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePrintServerUrl} className="w-full sm:w-auto ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('saveSettings' as TranslationKey)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
