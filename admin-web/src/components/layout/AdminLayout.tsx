import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer open/closed
  const [collapsed, setCollapsed] = useState(false);        // desktop collapse
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // close drawer when going to desktop
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile: sidebarOpen controls the drawer
  // On desktop: collapsed controls the width
  const handleMenuToggle = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  // For desktop sidebar: collapsed → 80px, expanded → 256px
  // For mobile: sidebar is a drawer that slides in from left
  const desktopCollapsed = !isMobile && collapsed;
  const mobileDrawerOpen = isMobile && sidebarOpen;

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      {/* Sidebar — desktop fixed, mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300
          ${isMobile
            ? mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            : 'translate-x-0'
          }`}
      >
        <AdminSidebar
          collapsed={desktopCollapsed}
          onToggle={handleMenuToggle}
          onNavClick={() => isMobile && setSidebarOpen(false)}
        />
      </div>

      {/* Mobile overlay — tap to close drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top bar */}
      <AdminTopBar
        onMenuToggle={handleMenuToggle}
        sidebarCollapsed={desktopCollapsed}
        isMobile={isMobile}
      />

      {/* Main content */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : desktopCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
