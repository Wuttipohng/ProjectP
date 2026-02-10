import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Titration Graph Generator',
    description: 'สร้างกราฟไทเทรชันจากข้อมูลการทดลอง - Web Application สำหรับนักศึกษาวิทยาศาสตร์',
    keywords: ['titration', 'chemistry', 'graph', 'pH', 'experiment'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th" className="dark">
            <body className={`${inter.variable} antialiased`}>
                <Navbar />
                <main className="min-h-[calc(100vh-64px)]">
                    {children}
                </main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid #383838',
                        },
                        success: {
                            iconTheme: {
                                primary: '#33b8ff',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}
