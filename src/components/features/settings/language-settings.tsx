
"use client"

import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Languages } from "lucide-react";
import type { Locale } from "@/types";

export function LanguageSettings() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Languages className="mr-2 h-5 w-5 text-primary" />
          {t('language')}
        </CardTitle>
        <CardDescription>{t('selectLanguage')}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
          className="space-y-2"
        >
          <Label
            htmlFor="lang-en"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="fi fi-gb rounded-sm"></span> {/* Placeholder for flag icon */}
              <span>{t('english')} (English)</span>
            </div>
            <RadioGroupItem value="en" id="lang-en" />
          </Label>
          <Label
            htmlFor="lang-tr"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="fi fi-tr rounded-sm"></span> {/* Placeholder for flag icon */}
              <span>{t('turkish')} (Türkçe)</span>
            </div>
            <RadioGroupItem value="tr" id="lang-tr" />
          </Label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
