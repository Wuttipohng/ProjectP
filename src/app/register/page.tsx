'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';
// ...existing code...
import { useAuthStore } from '@/stores/useAuthStore';
import { signUp, updateProfile } from '@/lib/local-db';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const { setUser, fetchProfile, fetchSettings, checkAdmin } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);

        const { user, error } = signUp(email, password, fullName);

        if (error) {
            toast.error(error);
            setLoading(false);
            return;
        }

        if (user) {
            // Update profile with university if provided
            if (university) {
// ...existing code...
                updateProfile(user.id, { university });
            }

            setUser(user);
            await fetchProfile();
            await fetchSettings();
            await checkAdmin();

            toast.success('สมัครสมาชิกสำเร็จ!');
            router.push('/tool');
        }

        setLoading(false);
    };

    const handleGoogleRegister = () => {
        toast.error('ระบบนี้ใช้สมัครด้วยอีเมล/รหัสผ่านเท่านั้น');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="animate-slide-up">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">สมัครสมาชิก</h1>
                        <p className="text-gray-400">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4" aria-label="form-register">
                        <Input
                            label="ชื่อ-นามสกุล"
                            type="text"
                            placeholder="ชื่อ นามสกุล"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            icon={<User className="h-4 w-4" />}
                            required
                        />

                        <Input
                            label="อีเมล"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="h-4 w-4" />}
                            required
                        />

                        <Input
                            label="มหาวิทยาลัย"
                            type="text"
                            placeholder="มหาวิทยาลัย..."
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            icon={<Building className="h-4 w-4" />}
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
                                className="absolute right-3 top-9 text-gray-400 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500/80 rounded"
                                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                            </button>
                        </div>

                        <Input
                            label="ยืนยันรหัสผ่าน"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            icon={<Lock className="h-4 w-4" />}
                            required
                        />

                        <Button type="submit" className="w-full" loading={loading}>
                            สมัครสมาชิก
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-dark-800 text-gray-400">หรือ</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleGoogleRegister}
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        สมัครด้วย Google
                    </Button>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link href="/login" className="text-primary-400 hover:text-primary-300">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
