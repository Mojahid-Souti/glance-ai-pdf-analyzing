// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Audiowide } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide'
})

export const metadata: Metadata = {
  title: 'Glance - PDF Analysis',
  description: 'AI-powered PDF analysis platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            socialButtonsPlacement: "bottom"
          }
        }}
        afterSignUpUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      >
        <body className={`${inter.variable} ${audiowide.variable} font-inter antialiased`} suppressHydrationWarning>
          {children}
        </body>
      </ClerkProvider>
    </html>
  )
}