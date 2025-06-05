
"use client"

import { useTheme } from "@/context/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Laptop } from "lucide-react"; // Icons for themes

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Appearance Settings</CardTitle>
        <CardDescription>Choose how OrderFlow looks and feels.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          className="space-y-2"
        >
          <Label
            htmlFor="theme-light"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center space-x-3">
              <Sun className="h-5 w-5" />
              <span>Light</span>
            </div>
            <RadioGroupItem value="light" id="theme-light" />
          </Label>
          <Label
            htmlFor="theme-dark"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center space-x-3">
              <Moon className="h-5 w-5" />
              <span>Dark</span>
            </div>
            <RadioGroupItem value="dark" id="theme-dark" />
          </Label>
          <Label
            htmlFor="theme-system"
            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center space-x-3">
              <Laptop className="h-5 w-5" />
              <span>System</span>
            </div>
            <RadioGroupItem value="system" id="theme-system" />
          </Label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
