import { Store, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { cn } from '../ui/Card'; // Reusando el util
import CartSidebar from '../pos/CartSidebar'; // TBD

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white">
            {/* 1. Sidebar Nav (Left - Fixed Small) */}
            <aside className="w-20 shrink-0 flex flex-col items-center py-6 border-r border-white/10 bg-kame-surface/50 backdrop-blur-md z-20">
                <div className="mb-10 p-3 bg-kame-orange/10 rounded-xl">
                    {/* Logo KAME Placeholder */}
                    <Store className="w-8 h-8 text-kame-orange" />
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full px-2">
                    <NavButton icon={ShoppingBag} active />
                    <NavButton icon={Settings} />
                </nav>

                <div className="mt-auto">
                    <NavButton icon={LogOut} />
                </div>
            </aside>

            {/* 2. Main Content (Center - 70%) */}
            <main className="w-[70%] h-full overflow-y-auto relative scroll-smooth p-6">
                <div className="max-w-5xl mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* 3. Cart Sidebar (Right - 30%) */}
            <aside className="w-[30%] shrink-0 border-l border-white/10 bg-kame-surface z-20 h-full">
                {/* Placeholder for Cart Component, will be replaced by real component */}
                <CartSidebar />
            </aside>
        </div>
    );
}

function NavButton({ icon: Icon, active }: { icon: any, active?: boolean }) {
    return (
        <button
            className={cn(
                "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
                active ? "bg-kame-orange text-black font-bold" : "hover:bg-white/5 text-gray-400 hover:text-white"
            )}
        >
            <Icon className={cn("w-6 h-6", active && "scale-110")} />
            {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-kame-orange rounded-l-full blur-[2px] opacity-50" />
            )}
        </button>
    )
}

// Simple Utility for styles
function clsx(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}
