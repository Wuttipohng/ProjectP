import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="animate-slide-up text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">หน้าเข้าสู่ระบบถูกปิด</h1>
                    <p className="text-gray-400 mb-6">ระบบการเข้าสู่ใช้งานถูกปิดชั่วคราว — โปรดใช้ฟีเจอร์โดยไม่ต้องล็อกอิน</p>
                    <div className="flex justify-center">
                        <Link href="/">
                            <Button>กลับไปยังหน้าแรก</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
