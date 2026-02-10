import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPrompt from './components/LoginPrompt';
import ProfileSetup from './components/ProfileSetup';
import MainContent from './components/MainContent';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { triggerQuickExit } from './utils/quickExit';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // Show profile setup if authenticated, profile is fetched, and no profile exists
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Global keyboard shortcut for Quick Exit (Ctrl/Cmd+Shift+Q)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+Q (Windows/Linux) or Cmd+Shift+Q (Mac)
      const isQuickExitShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'q';

      if (!isQuickExitShortcut) return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInputField) return;

      // Prevent default behavior and trigger Quick Exit
      event.preventDefault();
      event.stopPropagation();
      triggerQuickExit();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated]);

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!isAuthenticated ? (
            <LoginPrompt />
          ) : showProfileSetup ? (
            <ProfileSetup />
          ) : (
            <MainContent />
          )}
        </main>
        <Footer />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
