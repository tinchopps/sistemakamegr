import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProductGrid from './components/pos/ProductGrid';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* POS Route */}
                <Route path="/" element={
                    <MainLayout>
                        <ProductGrid />
                    </MainLayout>
                } />

                {/* Admin Route */}
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    );
}
