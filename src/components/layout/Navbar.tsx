'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FlaskConical, User, LogOut, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { getCurrentUser, recordVisit } from '@/lib/local-db';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { user, profile, isAdmin, logout, initialize } = useAuthStore();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        initialize();
        try {
            const cur = getCurrentUser();
            recordVisit(cur?.id || null, cur?.email || null);
        } catch (e) {
            // ignore
        }
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const navLinks = [
        { href: '/tool', label: 'เครื่องมือ', icon: FlaskConical },
        { href: '/profile', label: 'โปรไฟล์', icon: User },
    ];

    // Admin link removed — admin page has been deleted

    return (
        <nav className="sticky top-0 z-50 glass border-b border-dark-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group focus-visible:ring-2 focus-visible:ring-primary-500/80" aria-label="หน้าแรก">
                        <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" aria-hidden="true">
                            <FlaskConical className="h-6 w-6 text-primary-500" />
                        </div>
                        <span className="font-bold text-lg gradient-text hidden sm:block">
                            Titration Graph
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500/80',
                                    pathname === link.href
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-gray-400 hover:text-white hover:bg-dark-700'
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.label}</span>
                            </Link>
                        ))}

                        {user && (
                            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-dark-600">
                                <span className="text-sm text-gray-400">
                                    {profile?.full_name || user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-all"
                                    title="ออกจากระบบ"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-dark-600 animate-slide-up">
                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                        pathname === link.href
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-gray-400 hover:text-white hover:bg-dark-700'
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}

                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-dark-700 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>ออกจากระบบ</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
