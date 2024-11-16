// src/app/(dashboard)/layout.tsx
'use client';

import { UserButton } from '@clerk/nextjs';
import { FileText, Search, Settings, Layout, PlusCircle, Edit3, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import UploadModal from '@/components/dashboard/upload/UploadModal';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const handleUploadSuccess = (document: any) => {
    // Refresh the page to show new document
    router.refresh();
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [pathname]);
  
  const navigation = [
    { 
      icon: Layout, 
      label: 'Dashboard', 
      href: '/dashboard', 
      active: pathname === '/dashboard'
    },
    { 
      icon: FileText, 
      label: 'Documents', 
      href: '/dashboard/documents',
      active: pathname.includes('/dashboard/documents')
    },
    { 
      icon: Search, 
      label: 'Search', 
      href: '/dashboard/search',
      active: pathname.includes('/dashboard/search')
    },
    { 
      icon: Edit3, 
      label: 'Interactive Editor', 
      href: '/dashboard/editor',
      pro: true 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/dashboard/settings',
      active: pathname.includes('/dashboard/settings')
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Glance Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xl font-bold font-logo">
                  <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">G</span>LANCE
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col">
          {/* Upload Button */}
          <div className="p-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={18} />
              <span>Upload PDF</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className="px-3 space-y-0.5">
              {[
                { icon: Layout, label: 'Dashboard', href: '/dashboard', active: true },
                { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
                { icon: Search, label: 'Search', href: '#' },
                { 
                  icon: Edit3, 
                  label: 'Glance Editor', 
                  href: '/dashboard/editor',
                  disabled: false,
                  pro: true 
                },
                { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? '#' : item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors relative group
                    ${item.active ? 'bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 text-[#FF6B6B]' : 
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 
                      'text-gray-600 hover:bg-gray-50'}`}
                  onClick={e => item.disabled && e.preventDefault()}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.pro && (
                    <span className="ml-auto flex items-center bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white text-xs px-2 py-0.5 rounded-full">
                      <Crown size={12} className="mr-1" />
                      PRO
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Pro Plan Card */}
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10">
              <div className="flex items-center space-x-2 mb-3">
                <Crown size={20} className="text-[#FF6B6B]" />
                <h3 className="font-semibold text-[#FF6B6B]">Upgrade to Pro</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Get access to Interactive Editor and advanced features
              </p>
              <button className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative w-16 h-16"> 
                <div className="absolute inset-0 animate-ping bg-[#FF6B6B]/20 rounded-full" />
                <div className="relative w-16 h-16 animate-pulse">
                  <Image
                    src="/logo.png"
                    alt="Glance Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}