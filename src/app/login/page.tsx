'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// ...existing code...
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { setUser, fetchProfile, fetchSettings, fetchExperiments, checkAdmin } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { user, error } = signIn(email, password);

        if (error) {
            toast.error(error);
            setLoading(false);
            return;
        }

        if (user) {
            setUser(user);
            await fetchProfile();
            await fetchSettings();
            await fetchExperiments();
            await checkAdmin();
            toast.success('เข้าสู่ระบบสำเร็จ!');
            router.push('/tool');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="animate-slide-up">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">เข้าสู่ระบบ</h1>
                        <p className="text-gray-400">ยินดีต้อนรับกลับมา!</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            label="อีเมล"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="h-4 w-4" />}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="รหัสผ่าน"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock className="h-4 w-4" />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <Button type="submit" className="w-full" loading={loading}>
                            เข้าสู่ระบบ
                        </Button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-primary-400 hover:text-primary-300">
                            สมัครสมาชิก
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
