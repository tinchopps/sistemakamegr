import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCatalogStore } from './store/useCatalogStore';
import MainLayout from './components/layout/MainLayout';
import ProductGrid from './components/pos/ProductGrid';
import AdminPanel from './components/admin/AdminPanel';
import CashClosure from './components/admin/CashClosure';

export default function App() {
    // Global Subscription for Persistence (Kame Style)
    // Ensures data is loaded once and persists across navigation
    const subscribeToCatalog = useCatalogStore(state => state.subscribeToCatalog);

    useEffect(() => {
        console.log("App mounted: Subscribing to Catalog Store");
        const unsub = subscribeToCatalog();
        return () => {
            console.log("App unmounted: Unsubscribing");
            unsub();
        };
    }, [subscribeToCatalog]);

    return (
        <BrowserRouter>
            <Routes>
                {/* POS Route (Default) */}
                <Route path="/" element={
                    <MainLayout>
                        <ProductGrid />
                    </MainLayout>
                } />

                {/* Admin Route */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* Cash Closure Route */}
                <Route path="/closure" element={<CashClosure />} />
            </Routes>
        </BrowserRouter>
    );
}
