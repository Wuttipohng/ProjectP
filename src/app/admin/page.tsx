'use client';

import { useEffect, useState } from 'react';
import { Users, FlaskConical, BarChart3, Calendar, TrendingUp } from 'lucide-react';
// ...existing code...
import { formatDateThai } from '@/lib/utils';
import { getAllProfiles, getAllExperiments } from '@/lib/local-db';
import Card from '@/components/ui/Card';

interface Stats {
    totalUsers: number;
    totalExperiments: number;
    totalDataPoints: number;
    todaySignups: number;
    weeklyExperiments: number;
    recentUsers: {
        id: string;
        email: string;
        full_name: string | null;
        created_at: string;
    }[];
    recentExperiments: {
        id: string;
        experiment_name: string;
        created_at: string;
        user_email: string;
        user_name: string | null;
    }[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = () => {
        const profiles = getAllProfiles();
        const experiments = getAllExperiments();

        const totalDataPoints = experiments.reduce(
            (sum, exp) => sum + exp.volume_data.length,
            0
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySignups = profiles.filter(
            (p) => new Date(p.created_at) >= today
        ).length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyExperiments = experiments.filter(
            (e) => new Date(e.created_at) >= weekAgo
        ).length;

        const recentUsers = profiles
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const recentExperiments = experiments
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((exp) => {
                const profile = profiles.find((p) => p.id === exp.user_id);
                return {
                    id: exp.id,
                    experiment_name: exp.experiment_name,
                    created_at: exp.created_at,
                    user_email: profile?.email || 'ไม่ทราบ',
                    user_name: profile?.full_name || null,
                };
            });

        setStats({
            totalUsers: profiles.length,
            totalExperiments: experiments.length,
            totalDataPoints,
            todaySignups,
            weeklyExperiments,
            recentUsers,
            recentExperiments,
        });
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-dark-700 rounded w-1/4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-dark-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            icon: Users,
            label: 'ผู้ใช้ทั้งหมด',
            value: stats.totalUsers,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
        {
            icon: FlaskConical,
            label: 'การทดลอง',
            value: stats.totalExperiments,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
        },
        {
            icon: BarChart3,
            label: 'จุดข้อมูล',
            value: stats.totalDataPoints,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
        },
        {
            icon: TrendingUp,
            label: 'สัปดาห์นี้',
            value: stats.weeklyExperiments,
            subLabel: 'การทดลอง',
            color: 'text-green-400',
            bg: 'bg-green-500/10',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    📊 Admin Dashboard
                </h1>
                <p className="text-gray-400 mt-1">ภาพรวมการใช้งานระบบ</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        className="relative overflow-hidden"
                        aria-label={`${stat.label} — ${stat.value}`}
                    >
                        <div className={`absolute inset-0 ${stat.bg} opacity-50`} aria-hidden="true"></div>
                        <div className="relative">
                            <stat.icon className={`h-8 w-8 ${stat.color} mb-2`} aria-hidden="true" />
                            <p className="text-3xl font-bold text-white" aria-live="polite" aria-atomic="true">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-400">
                                {stat.label}
                                {stat.subLabel && (
                                    <span className="text-xs ml-1">({stat.subLabel})</span>
                                )}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        ผู้ใช้ล่าสุด
                    </h2>
                    <div className="space-y-3" role="list" aria-label="ผู้ใช้ล่าสุด">
                        {stats.recentUsers.map((user) => (
                            <div
                                key={user.id}
                                role="listitem"
                                tabIndex={0}
                                className="flex items-center justify-between p-3 bg-dark-700 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-400"
                            >
                                <div>
                                    <p className="text-white font-medium">
                                        {user.full_name || 'ไม่ระบุชื่อ'}
                                    </p>
                                    <p className="text-sm text-gray-400">{user.email}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDateThai(user.created_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Experiments */}
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary-400" />
                        การทดลองล่าสุด
                    </h2>
                    <div className="space-y-3" role="list" aria-label="การทดลองล่าสุด">
                        {stats.recentExperiments.map((exp) => (
                            <div
                                key={exp.id}
                                role="listitem"
                                tabIndex={0}
                                className="flex items-center justify-between p-3 bg-dark-700 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-400"
                            >
                                <div>
                                    <p className="text-white font-medium">{exp.experiment_name}</p>
                                    <p className="text-sm text-gray-400">
                                        {exp.user_name || exp.user_email}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDateThai(exp.created_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Today Stats */}
            <Card className="mt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary-400" />
                        <div>
                            <p className="text-lg font-semibold text-white">สถิติวันนี้</p>
                            <p className="text-sm text-gray-400">
                                {new Date().toLocaleDateString('th-TH', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary-400">
                            {stats.todaySignups}
                        </p>
                        <p className="text-sm text-gray-400">สมาชิกใหม่</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
