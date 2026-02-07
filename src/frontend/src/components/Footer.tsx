import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-primary/20 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            <span>© 2026. Built with</span>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary flex-shrink-0" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary transition-colors font-semibold"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
