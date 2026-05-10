import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import dayjs from 'dayjs';
import AppThemeProvider from './{components}/AppThemeProvider';
import AppProvider from './{components}/AppProvider/AppProvider';
import AppTopBar from './{components}/AppTopBar';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Anime Openings Quiz',
  description: 'Anime Openings Quiz',
};

dayjs.extend(relativeTime);
dayjs.locale('ru');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppThemeProvider>
            <AppProvider>
              <AppTopBar />
              {children}
            </AppProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
