import { Providers } from "./providers"
import "./globals.css"

export const metadata = {
  title: "Jamez AI Assistant",
  description: "AI-powered voice assistant",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden">
        <Providers>
          <div className="min-h-screen w-full bg-[#0A0B14] overflow-x-hidden">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

