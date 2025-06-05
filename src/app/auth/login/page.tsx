
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt with:', { email, password });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would handle authentication here
    // For demo, let's assume login is successful
    toast({
      title: 'Login Successful',
      description: 'Redirecting to dashboard...',
    });
    router.push('/dashboard/overview'); // Redirect to a dashboard page

    // Example of error handling:
    // toast({
    //   title: 'Login Failed',
    //   description: 'Invalid email or password.',
    //   variant: 'destructive',
    // });
    // setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Don't have an account? Sign up
        </Link>
        <Link href="#" className="text-muted-foreground hover:underline">
            Forgot password?
        </Link>
      </CardFooter>
    </Card>
  );
}
