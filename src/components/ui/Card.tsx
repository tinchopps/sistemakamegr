import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "bg-kame-surface rounded-2xl border border-white/5 overflow-hidden",
                "transition-all duration-300 hover:border-white/10",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
