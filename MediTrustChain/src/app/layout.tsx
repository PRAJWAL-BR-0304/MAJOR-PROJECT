
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import GlobalThemeToggle from "@/components/global-theme-toggle";
import { AIChatbot } from "@/components/ai-chatbot";
import { CbacAuthProvider } from '@/contexts/cbac-auth-context';
import { TenantProvider } from '@/contexts/tenant-context';
import { BatchesProvider } from '@/contexts/batches-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { RecallProvider } from '@/contexts/recall-context';
import { SearchProvider } from '@/contexts/search-context';
import { PreferencesProvider } from '@/contexts/preferences-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { BlockchainProvider } from '@/lib/blockchain';
import '@/lib/clear-data'; // Import to expose clear functions to window

export const metadata: Metadata = {
  title: 'MediTrustChain',
  description: 'Blockchain-based pharmaceutical supply chain for drug authenticity and transparency',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BlockchainProvider>
              <CbacAuthProvider>
                <TenantProvider>
                  <NotificationsProvider>
                    <BatchesProvider>
                      <RecallProvider>
                        <SearchProvider>
                          <PreferencesProvider>
                            <AnalyticsProvider>
                              <GlobalThemeToggle />
                              <AIChatbot />
                              {children}
                              <Toaster />
                            </AnalyticsProvider>
                          </PreferencesProvider>
                        </SearchProvider>
                      </RecallProvider>
                    </BatchesProvider>
                  </NotificationsProvider>
                </TenantProvider>
              </CbacAuthProvider>
            </BlockchainProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
