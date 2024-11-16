'use client';

import React, { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { 
  FileText, 
  Search, 
  Settings, 
  LayoutDashboard, 
  PlusCircle,
  Edit3,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import UploadModal from '@/components/dashboard/upload/UploadModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const handleUploadSuccess = (newDocument: any) => {
    setDocuments(prev => [newDocument, ...prev]);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b h-14">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="text-xl font-logo">
                  <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">G</span>
                  <span>LANCE</span>
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonTrigger: "h-8 w-8"
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-[calc(100vh-3.5rem)] border-r flex flex-col">
          {/* Upload Button */}
          <div className="p-4">
            <button 
              onClick={() => setIsUploadModalOpen(true)} 
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity shadow-md"
            >
              <PlusCircle size={18} />
              <span className="font-medium">Upload PDF</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1">
            <div className="px-3 space-y-0.5">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
                { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
                { icon: Search, label: 'Search', href: '/dashboard/search' },
                { 
                  icon: Edit3, 
                  label: 'Interactive Editor', 
                  href: '/dashboard/editor',
                  disabled: false,
                  pro: true 
                },
                { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors relative group
                    ${item.active ? 'bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 text-[#FF6B6B]' : 
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 
                      'text-gray-600 hover:bg-gray-50'}`}
                  onClick={e => item.disabled && e.preventDefault()}
                >
                  <item.icon size={18} className={item.active ? 'text-[#FF6B6B]' : 'text-gray-500'} />
                  <span className={`flex-1 ${item.active ? 'font-medium' : ''}`}>{item.label}</span>
                  {item.pro && (
                    <span className="flex items-center bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white text-xs px-2 py-0.5 rounded-full">
                      <Crown size={12} className="mr-1" />
                      PRO
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Pro Plan Card */}
          <div className="p-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 border border-[#FF6B6B]/20">
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

        {/* Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
        <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        />
    </div>
  );
}