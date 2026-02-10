'use client';

import { Clock, FlaskConical, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToolStore } from '@/stores/useToolStore';
// ...existing code...
import { formatDateThai } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ExperimentHistory() {
    const { experiments, fetchExperiments } = useAuthStore();
    const { loadExperiment } = useToolStore();

    const handleLoad = (exp: (typeof experiments)[0]) => {
        loadExperiment(exp);
        toast.success(`โหลด "${exp.experiment_name}" สำเร็จ!`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('คุณต้องการลบการทดลองนี้?')) return;

        const success = deleteExperiment(id);

        if (!success) {
            toast.error('ลบไม่สำเร็จ');
            return;
        }

        await fetchExperiments();
        toast.success('ลบสำเร็จ!');
    };

    if (experiments.length === 0) {
        return (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center">
                <FlaskConical className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">ยังไม่มีประวัติการทดลอง</p>
                <p className="text-sm text-gray-500 mt-1">
                    เริ่มใส่ข้อมูลและกดคำนวณเพื่อบันทึกการทดลอง
                </p>
            </div>
        );
    }

    return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-400" />
                ประวัติการทดลอง
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {experiments.map((exp) => (
                    <div
                        key={exp.id}
                        className="group p-4 bg-dark-700 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">
                                    {exp.experiment_name} {exp.experiment_no}
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                    <span>{exp.volume_data.length} จุด</span>
                                    <span>•</span>
                                    <span>{formatDateThai(exp.created_at)}</span>
                                    {exp.exp_type && (
                                        <>
                                            <span>•</span>
                                            <span className="text-primary-400">{exp.exp_type}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleLoad(exp)}
                                >
                                    โหลด
                                </Button>
                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
