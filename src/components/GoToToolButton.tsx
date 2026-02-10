"use client";

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useToolStore } from '@/stores/useToolStore';

export default function GoToToolButton() {
    const router = useRouter();
    const setActiveTab = useToolStore((s) => s.setActiveTab);

    const handleClick = useCallback(() => {
        try {
            // prepare tool state if needed
            setActiveTab('input');
        } catch (e) {
            // ignore
        }
        router.push('/tool');
    }, [router, setActiveTab]);

    return (
        <Button
            variant="ghost"
            size="lg"
            onClick={handleClick}
            className="group border border-primary-500/30 text-primary-100 bg-transparent hover:bg-primary-500/8 hover:border-primary-400 focus:ring-2 focus:ring-primary-300/20 transition-all"
        >
            ไปที่เครื่องมือ
            <ArrowRight className="ml-2 h-4 w-4 text-primary-300 group-hover:translate-x-1 group-hover:text-white transition-all" />
        </Button>
    );
}
