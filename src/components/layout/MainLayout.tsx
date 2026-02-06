import { Store, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { cn } from '../ui/Card';
import CartSidebar from '../pos/CartSidebar';
import { useNavigate, useLocation } from 'react-router-dom';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isPosActive = location.pathname === '/';

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white font-sans">
            {/* 1. Sidebar Nav (Left - Fixed Small) */}
            <aside className="w-24 shrink-0 flex flex-col items-center py-8 border-r border-white/10 bg-[#1E1E1E] z-20 shadow-2xl">
                <div className="mb-12 p-3 bg-kame-orange/10 rounded-2xl ring-1 ring-kame-orange/20">
                    <Store className="w-8 h-8 text-kame-orange" />
                </div>

                <nav className="flex-1 flex flex-col gap-8 w-full px-4 items-center">
                    <NavButton
                        icon={ShoppingBag}
                        label="POS"
                        active={isPosActive}
                        onClick={() => navigate('/')}
                        testId="nav-pos"
                    />
                    <NavButton
                        icon={Settings}
                        label="Admin"
                        active={false} // Since we leave this layout for Admin, it's never active here technically, or we could check if we were wrapped.
                        onClick={() => navigate('/admin')}
                        testId="nav-admin"
                    />
                </nav>

                <div className="mt-auto mb-4">
                    <NavButton
                        icon={LogOut}
                        label="Salir"
                        onClick={() => console.log('Logout')}
                    />
                </div>
            </aside>

            {/* 2. Main Content (Center - 70%) */}
            <main className="flex-1 h-full overflow-y-auto relative scroll-smooth bg-[#121212] p-8">
                <div className="max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* 3. Cart Sidebar (Right - 30%) */}
            <aside className="w-[400px] shrink-0 border-l border-white/10 bg-[#1E1E1E] z-20 h-full shadow-2xl">
                <CartSidebar />
            </aside>
        </div>
    );
}

function NavButton({
    icon: Icon,
    active,
    onClick,
    testId,
    label
}: {
    icon: any,
    active?: boolean,
    onClick?: () => void,
    testId?: string,
    label?: string
}) {
    return (
        <button
            onClick={onClick}
            data-testid={testId}
            className={cn(
                "group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 w-16 h-16",
                active
                    ? "bg-kame-orange text-black shadow-[0_0_20px_rgba(230,126,34,0.4)]"
                    : "hover:bg-white/5 text-gray-400 hover:text-white hover:scale-105"
            )}
            title={label}
        >
            <Icon className={cn("w-7 h-7 mb-1", active && "scale-110")} />

            {/* Active Indicator Glow */}
            {active && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md -z-10" />
            )}
        </button>
    )
}
