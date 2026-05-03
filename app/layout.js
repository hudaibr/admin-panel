import './globals.css'

export const metadata = {
  title: 'Admin Panel',
  description: 'Production admin panel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
