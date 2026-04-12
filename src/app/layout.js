import './globals.css';
import { Playfair_Display, Poppins, Great_Vibes } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cursive',
  display: 'swap',
  preload: false,
});

export const metadata = {
  title: 'KalyanamStudio — Royal South Indian Invitations',
  description: 'Create stunning, premium South Indian wedding invitations in minutes. 1:1 Reference Grade UI/UX with interactive features.',
  keywords: 'wedding invitation, digital invitation, South Indian wedding, Telugu wedding, Tamil wedding, online wedding card',
  openGraph: {
    title: 'KalyanamStudio — Royal South Indian Invitations',
    description: 'Transform your wedding story into a digital masterpiece.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${greatVibes.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
