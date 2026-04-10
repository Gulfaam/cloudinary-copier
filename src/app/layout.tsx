import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cloudinary Folder Copier | Seamless Asset Transfer',
  description: 'An elegant and efficient tool to transfer full folders and their contents between Cloudinary accounts seamlessly.',
  keywords: ['Cloudinary', 'Asset Transfer', 'Folder Copy', 'Tool', 'Web App', 'SEO Optimized'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-purple-500/30`}>
        {children}
      </body>
    </html>
  );
}
