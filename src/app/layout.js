import './globals.css';
import { Playfair_Display, Poppins } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'KalyanamStudio — South Indian Wedding Invitations',
  description: 'Create stunning, personalised South Indian wedding invitations in minutes. Share digitally, collect RSVPs, and celebrate your special day beautifully.',
  keywords: 'wedding invitation, digital invitation, South Indian wedding, Telugu wedding, Tamil wedding, online wedding card',
  openGraph: {
    title: 'KalyanamStudio — South Indian Wedding Invitations',
    description: 'Create stunning South Indian wedding invitations in minutes.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
