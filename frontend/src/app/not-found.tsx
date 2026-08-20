'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-accent">404</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-foreground/70 max-w-md mb-8">
        Sorry, we couldn't find the page you are looking for. It might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="default">Back to Home</Button>
        </Link>
        <Link href="/feed">
          <Button variant="outline">Go to Feed</Button>
        </Link>
      </div>
    </div>
  );
}
