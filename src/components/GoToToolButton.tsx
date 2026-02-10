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
        <Button size="lg" onClick={handleClick} className="group">
            ไปที่เครื่องมือ
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
    );
}
