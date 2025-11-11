import { ReactNode } from 'react';
import { DoctorSidebar } from './DoctorSidebar';

interface DoctorLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorLayout({ children, currentPage, onNavigate, onLogout }: DoctorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <DoctorSidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
