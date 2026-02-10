'use client';

import { useState } from 'react';
import { User, Mail, Building, Save, FlaskConical } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatDateThai } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ExperimentHistory from '@/components/tool/ExperimentHistory';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, profile, experiments, updateProfile } = useAuthStore();

    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [university, setUniversity] = useState(profile?.university || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await updateProfile({
            full_name: fullName,
            university: university,
        });
        toast.success('บันทึกโปรไฟล์สำเร็จ!');
        setLoading(false);
    };

    // Stats
    const totalExperiments = experiments.length;
    const totalDataPoints = experiments.reduce(
        (sum, exp) => sum + exp.volume_data.length,
        0
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                👤 โปรไฟล์ของฉัน
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">ข้อมูลส่วนตัว</h2>

                    <div className="space-y-4">
                        <Input
                            label="ชื่อ-นามสกุล"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            icon={<User className="h-4 w-4" />}
                            placeholder="ชื่อ นามสกุล"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                อีเมล
                            </label>
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-400">
                                <Mail className="h-4 w-4" />
                                <span>{user?.email}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
                        </div>

                        <Input
                            label="มหาวิทยาลัย"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            icon={<Building className="h-4 w-4" />}
                            placeholder="มหาวิทยาลัย..."
                        />

                        <Button onClick={handleSave} loading={loading} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            บันทึก
                        </Button>
                    </div>
                </Card>

                {/* Stats Card */}
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">สถิติการใช้งาน</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-dark-700 rounded-lg text-center">
                            <FlaskConical className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{totalExperiments}</p>
                            <p className="text-sm text-gray-400">การทดลอง</p>
                        </div>

                        <div className="p-4 bg-dark-700 rounded-lg text-center">
                            <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{totalDataPoints}</p>
                            <p className="text-sm text-gray-400">จุดข้อมูล</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dark-600">
                        <p className="text-sm text-gray-400">
                            สมาชิกตั้งแต่:{' '}
                            <span className="text-white">
                                {profile?.created_at
                                    ? formatDateThai(profile.created_at)
                                    : '-'}
                            </span>
                        </p>
                    </div>
                </Card>
            </div>

            {/* Experiment History */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                    📜 ประวัติการทดลอง
                </h2>
                <ExperimentHistory />
            </div>
        </div>
    );
}
