import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { triggerQuickExit } from '../utils/quickExit';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleQuickExit = () => {
    triggerQuickExit();
  };

  return (
    <header className="border-b-2 border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-xl gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center shadow-lg flex-shrink-0">
              <img 
                src="/assets/generated/reporther-app-icon-192.dim_192x192.png" 
                alt="Reporther icon" 
                className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm xs:text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                Reporther
              </h1>
              <p className="text-[10px] xs:text-xs font-semibold text-primary/80 truncate">Document. Track. Report.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-md">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">{userProfile.name}</span>
              </div>
            )}

            {isAuthenticated && (
              <Button
                onClick={handleQuickExit}
                variant="destructive"
                size="sm"
                className="rounded-full font-bold border-2 text-xs xs:text-sm px-3 xs:px-4 h-8 xs:h-9 bg-destructive hover:bg-destructive/90 flex items-center gap-1.5"
                title="Quick Exit - Leave immediately"
              >
                <LogOut className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">Quick Exit</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10 h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-primary" />
              ) : (
                <Moon className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-primary" />
              )}
            </Button>

            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              className="rounded-full font-semibold border-2 text-xs xs:text-sm px-3 xs:px-4 sm:px-5 h-8 xs:h-9 sm:h-10"
            >
              {disabled ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
