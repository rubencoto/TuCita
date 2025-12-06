import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsuarios } from './AdminUsuarios';
import { AdminEspecialidades } from './AdminEspecialidades';
import { AdminCitas } from './AdminCitas';
import { AdminCitasNueva } from './AdminCitasNueva';
import { AdminReportes } from './AdminReportes';

type AdminPage = 'dashboard' | 'usuarios' | 'especialidades' | 'citas' | 'citas-nueva' | 'reportes';

interface AdminPanelProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function AdminPanel({ onNavigate: externalNavigate, onLogout }: AdminPanelProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const handleNavigate = (page: AdminPage) => {
    setCurrentPage(page);
    // No llamar a externalNavigate aquí - la navegación es interna del admin
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'usuarios':
        return <AdminUsuarios />;
      case 'especialidades':
        return <AdminEspecialidades />;
      case 'citas':
        return <AdminCitas onCreateNew={() => setCurrentPage('citas-nueva')} />;
      case 'citas-nueva':
        return <AdminCitasNueva onBack={() => setCurrentPage('citas')} />;
      case 'reportes':
        return <AdminReportes />;
      default:
        return <AdminDashboard />;
    }
  };

  // Map citas-nueva to citas for sidebar highlighting
  const sidebarPage = currentPage === 'citas-nueva' ? 'citas' : currentPage;

  return (
    <AdminLayout
      currentPage={sidebarPage as any}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
}
