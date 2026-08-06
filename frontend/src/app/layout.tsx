import React from 'react';
import 'leaflet/dist/leaflet.css';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'SlideShield | AI-Powered Landslide Early Warning & Rescue Platform',
  description: 'AI disaster management platform predicting landslide risks, providing real-time warnings, citizen hazard reporting with AI image scanner, and government rescue coordination.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050b18] text-slate-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
