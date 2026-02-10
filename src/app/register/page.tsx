import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card className="animate-slide-up text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">การลงทะเบียนถูกปิด</h1>
                    <p className="text-gray-400 mb-6">การสมัครสมาชิกถูกปิด — โปรดติดต่อผู้ดูแลระบบหากต้องการบัญชี</p>
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
