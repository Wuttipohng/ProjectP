import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    icon,
    className,
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        'w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/80 focus:border-primary-500',
                        'transition-all duration-200',
                        icon && 'pl-10',
                        error && 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/80',
                        className
                    )}
                    autoComplete={props.autoComplete || 'on'}
                    name={props.name || (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined)}
                    type={props.type || 'text'}
                    aria-label={label ? undefined : props['aria-label'] || 'input'}
                    spellCheck={props.type === 'email' || props.type === 'username' ? false : undefined}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-400" role="alert">{error}</p>
            )}
        </div>
    );
}
