// components/layout/Footer.tsx
import { Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            EventHub - Built with Cloudflare Stack
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}