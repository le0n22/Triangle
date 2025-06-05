
'use client';

import type { SVGProps } from 'react';

// Basic Placeholder SVGs - replace with actual logos or more detailed SVGs later

export function TrendyolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="#F27A1A" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">T</text>
    </svg>
  );
}

export function YemeksepetiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="#DE002D" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Y</text>
    </svg>
  );
}

export function GetirIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="#5D3EBC" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">G</text>
    </svg>
  );
}

export function GenericPlatformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="hsl(var(--muted))" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">?</text>
    </svg>
  );
}

export const platformIconMap: Record<string, React.ElementType> = {
  'Trendyol GO': TrendyolIcon,
  'Yemeksepeti': YemeksepetiIcon,
  'Getir': GetirIcon,
  'Migros Yemek': GetirIcon, // Placeholder for Migros, using Getir for now
  default: GenericPlatformIcon,
};
