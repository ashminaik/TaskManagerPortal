import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar onToggle={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow-md"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      <main className="lg:ml-64 min-h-screen">
        <Header />
        <div className="px-4 md:px-6 lg:px-8 pb-8">{children}</div>
      </main>
    </div>
  );
}
