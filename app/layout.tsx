import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JSON Security Analyzer',
  description: 'AI-Powered JSON Security Analysis - Detect anomalies and threats',
  keywords: ['JSON analysis', 'security', 'anomaly detection', 'AI'],
  authors: [{ name: 'Security Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}