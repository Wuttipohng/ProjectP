import Link from 'next/link';
import { FlaskConical, BarChart3, FileText, Zap, Shield } from 'lucide-react';

export default function HomePage() {
    const features = [
        {
            icon: Zap,
            title: 'Smart Paste',
            description: 'Copy จาก Excel แล้ว Paste ได้เลย รองรับ Tab, Comma, Space',
        },
        {
            icon: BarChart3,
            title: 'กราฟสวยงาม',
            description: 'กราฟ pH และ ΔpH/ΔV พร้อมบอก End Point อัตโนมัติ',
        },
        {
            icon: FileText,
            title: 'PDF Report',
            description: 'Export PDF 2 หน้า สวยงาม พร้อมใช้ส่งอาจารย์',
        },
        {
            icon: Shield,
            title: 'บันทึกประวัติ',
            description: 'เก็บประวัติการทดลอง เรียกดูย้อนหลังได้',
        },
    ];

    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-purple-500/10" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8">
                            <FlaskConical className="h-4 w-4 text-primary-400" />
                            <span className="text-sm text-primary-400">สำหรับนักศึกษาวิทยาศาสตร์</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="gradient-text">Titration Graph</span>
                            <br />
                            <span className="text-white">Generator</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            สร้างกราฟไทเทรชันจากข้อมูลการทดลอง
                            <br className="hidden sm:block" />
                            วิเคราะห์ End Point และ Export PDF ได้ในคลิกเดียว
                        </p>

                        {/* CTA removed: login/register buttons intentionally hidden */}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-dark-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            ฟีเจอร์ที่ทำให้ชีวิตง่ายขึ้น
                        </h2>
                        <p className="text-gray-400">
                            ออกแบบมาเพื่อนักศึกษาเคมีโดยเฉพาะ
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                                    <feature.icon className="h-6 w-6 text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-600 rounded-2xl p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    วิธีใช้งานง่ายๆ
                                </h2>
                                <ol className="space-y-4 text-gray-300">
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                                            1
                                        </span>
                                        <span>Copy ข้อมูล Volume และ pH จาก Excel</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                                            2
                                        </span>
                                        <span>Paste ลงในตาราง (Smart Paste ใส่ให้อัตโนมัติ)</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                                            3
                                        </span>
                                        <span>กดคำนวณ — เห็นกราฟและ End Point ทันที</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                                            4
                                        </span>
                                        <span>Export PDF สวยๆ ส่งอาจารย์ได้เลย</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative">
                                <div className="aspect-video bg-dark-700 rounded-xl border border-dark-600 flex items-center justify-center">
                                    <div className="text-center">
                                        <FlaskConical className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                                        <p className="text-gray-400">ตัวอย่างกราฟ</p>
                                    </div>
                                </div>
                                {/* Glow effect */}
                                <div className="absolute -inset-4 bg-primary-500/10 rounded-2xl blur-xl -z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-b from-transparent to-primary-500/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        พร้อมสร้างกราฟแล้วหรือยัง?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        สมัครฟรี ใช้งานได้ทันที ไม่มีค่าใช้จ่าย
                    </p>
                    {/* CTA removed: registration button intentionally hidden */}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-dark-700">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© 2026 Titration Graph Generator. Made with 💜 for Science Students.</p>
                </div>
            </footer>
        </div>
    );
}
