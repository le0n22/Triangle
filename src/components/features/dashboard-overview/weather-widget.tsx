'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SunMedium, CloudSun, CloudMoon, Cloud, CloudRain, CloudSnow, CloudLightning, Thermometer } from 'lucide-react'; // Added more icons

export function WeatherWidget() {
  // Placeholder weather data - In a real app, this would come from an API
  const weather = {
    temperature: 22,
    description: 'Sunny',
    icon: SunMedium, // Default to Sun
  };

  // Example of how you might choose an icon based on description (simplified)
  const getWeatherIcon = (desc: string) => {
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes('sunny') || lowerDesc.includes('clear')) return SunMedium;
    if (lowerDesc.includes('partly cloudy')) return CloudSun;
    if (lowerDesc.includes('cloudy')) return Cloud;
    if (lowerDesc.includes('rain')) return CloudRain;
    if (lowerDesc.includes('snow')) return CloudSnow;
    if (lowerDesc.includes('storm') || lowerDesc.includes('thunder')) return CloudLightning;
    return Thermometer; // Fallback
  }

  const WeatherIcon = getWeatherIcon(weather.description);


  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-primary">Weather</h2>
        </div>
        <div className="flex items-center justify-center">
          <WeatherIcon className="w-16 h-16 text-yellow-400 mr-4" />
          <div>
            <p className="text-4xl font-bold">{weather.temperature}°C</p>
            <p className="text-md text-muted-foreground">{weather.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
