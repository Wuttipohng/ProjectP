import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export default function Card({ children, className, hover, glow }: CardProps) {
    return (
        <div
            className={cn(
                'bg-dark-800 border border-dark-600 rounded-xl p-6',
                hover && 'transition-all duration-200 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer',
                glow && 'animate-pulse-glow',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-white', className)}>
            {children}
        </h3>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={cn('text-gray-300', className)}>
            {children}
        </div>
    );
}
