import { Inter } from 'next/font/google'
import './assets/scss/style.scss'
import './assets/scss/bootstrap.scss'
import './assets/css/materialdesignicons.min.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight:['400','500','600'],
  variable: '--font-inter',
 })

export const metadata = {
  title: 'Doctris - Next Js Doctor Appointment Booking System',
  description: 'Doctris - Next Js Doctor Appointment Booking System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
}
