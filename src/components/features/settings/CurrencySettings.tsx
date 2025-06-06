
"use client"

import { useState, useEffect } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { PREDEFINED_CURRENCIES } from "@/context/CurrencyProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coins } from "lucide-react";
import type { CurrencyConfig } from "@/types";
import { useLanguage } from "@/hooks/use-language";


export function CurrencySettings() {
  const { currency, setCurrency } = useCurrency();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currency.code);
  const [customSymbol, setCustomSymbol] = useState(currency.code === 'CUSTOM' ? currency.symbol : '');
  const [customName, setCustomName] = useState(currency.code === 'CUSTOM' ? currency.name : '');

  useEffect(() => {
    setSelectedCurrencyCode(currency.code);
    if (currency.code === 'CUSTOM') {
      setCustomSymbol(currency.symbol);
      setCustomName(currency.name);
    } else {
      setCustomSymbol('');
      setCustomName('');
    }
  }, [currency]);

  const handleSave = () => {
    let newCurrency: CurrencyConfig;
    if (selectedCurrencyCode === 'CUSTOM') {
      if (!customSymbol.trim() || !customName.trim()) {
        toast({
          title: "Error",
          description: "Custom currency symbol and name cannot be empty.",
          variant: "destructive",
        });
        return;
      }
      newCurrency = {
        symbol: customSymbol.trim(),
        code: 'CUSTOM',
        name: customName.trim(),
      };
    } else {
      newCurrency = PREDEFINED_CURRENCIES[selectedCurrencyCode];
    }
    setCurrency(newCurrency);
    toast({
      title: "Currency Updated",
      description: `Currency set to ${newCurrency.name} (${newCurrency.symbol})`,
    });
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Coins className="mr-2 h-5 w-5 text-primary" />
          {t('currency')}
        </CardTitle>
        <CardDescription>{t('selectCurrency')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedCurrencyCode}
          onValueChange={(value) => setSelectedCurrencyCode(value)}
          className="space-y-2"
        >
          {Object.values(PREDEFINED_CURRENCIES).map((curr) => (
            <Label
              key={curr.code}
              htmlFor={`curr-${curr.code}`}
              className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span>{t(curr.code.toLowerCase() as 'turkish_lira' | 'us_dollar' | 'euro')} ({curr.symbol})</span>
              <RadioGroupItem value={curr.code} id={`curr-${curr.code}`} />
            </Label>
          ))}
          <Label
            htmlFor="curr-CUSTOM"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span>{t('customCurrency')}</span>
            <RadioGroupItem value="CUSTOM" id="curr-CUSTOM" />
          </Label>
        </RadioGroup>

        {selectedCurrencyCode === 'CUSTOM' && (
          <div className="space-y-4 p-4 border border-dashed border-border rounded-md mt-4">
            <div className="space-y-1">
              <Label htmlFor="customSymbol">{t('currencySymbol')}</Label>
              <Input
                id="customSymbol"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="e.g., £"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="customName">{t('currencyName')}</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., British Pound"
              />
            </div>
          </div>
        )}
        <Button onClick={handleSave} className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Currency Settings
        </Button>
      </CardContent>
    </Card>
  );
}
