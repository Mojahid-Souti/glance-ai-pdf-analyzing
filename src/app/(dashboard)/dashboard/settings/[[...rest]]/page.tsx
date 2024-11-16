// src/app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { 
  Moon, Sun, Monitor, Globe, Bell, 
  Keyboard, HardDrive, Layout, Paintbrush,
  Shield, Database, ChevronRight, Settings,
  CircleDashed
} from 'lucide-react';


interface SettingOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const settingOptions: SettingOption[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: <Paintbrush className="w-5 h-5" />,
    description: 'Customize your theme and visual preferences'
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: <Keyboard className="w-5 h-5" />,
    description: 'Configure editor behavior and defaults'
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'Manage your document storage and backups'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    description: 'Control your notification preferences'
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: <Shield className="w-5 h-5" />,
    description: 'Manage your privacy and security settings'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);
  const [editorDefaults, setEditorDefaults] = useState({
    fontSize: '16px',
    fontFamily: 'Inter',
    lineHeight: '1.5',
    autosave: true,
    spellcheck: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none p-0",
              navbar: "hidden",
              pageScrollBox: "p-3"
            }
          }}
        />
      );
    }
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                <ThemeButton
                  active={theme === 'light'}
                  onClick={() => setTheme('light')}
                  icon={<Sun />}
                  label="Light"
                />
                <ThemeButton
                  active={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  icon={<Moon />}
                  label="Dark"
                />
                <ThemeButton
                  active={theme === 'system'}
                  onClick={() => setTheme('system')}
                  icon={<Monitor />}
                  label="System"
                />
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold mb-4">Language & Region</h3>
              <div className="max-w-xs">
                <select className="w-full p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B] outline-none transition-all">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Select your preferred language for the interface
                </p>
              </div>
            </section>
          </div>
        );
      case 'editor':
        return (
          <div className="p-6 space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-4">Editor Preferences</h3>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select 
                    value={editorDefaults.fontSize}
                    onChange={(e) => setEditorDefaults(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="w-full max-w-xs p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B] outline-none transition-all"
                  >
                    {['12px', '14px', '16px', '18px', '20px'].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select 
                    value={editorDefaults.fontFamily}
                    onChange={(e) => setEditorDefaults(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full max-w-xs p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B] outline-none transition-all"
                  >
                    {['Inter', 'Arial', 'Times New Roman', 'Georgia'].map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorDefaults.autosave}
                      onChange={(e) => setEditorDefaults(prev => ({ ...prev, autosave: e.target.checked }))}
                      className="rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <div>
                      <span className="font-medium">Enable autosave</span>
                      <p className="text-sm text-gray-500">Automatically save your changes</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorDefaults.spellcheck}
                      onChange={(e) => setEditorDefaults(prev => ({ ...prev, spellcheck: e.target.checked }))}
                      className="rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                    />
                    <div>
                      <span className="font-medium">Enable spellcheck</span>
                      <p className="text-sm text-gray-500">Check spelling while typing</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-24 h-24 mb-6">
              <CircleDashed className="w-24 h-24 text-gray-200 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {settingOptions.find(opt => opt.id === activeTab)?.icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {settingOptions.find(opt => opt.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500 max-w-sm">
              This feature is coming soon. We're working hard to bring you the best experience possible.
            </p>
          </div>
        );
    };
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-5 h-5 text-[#FF6B6B]" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>
        
        <div className="p-3">
          {/* Profile Section */}
          <MenuButton
            active={activeTab === 'profile'}
            icon={<Layout />}
            label="Profile"
            description="Manage your account"
            onClick={() => setActiveTab('profile')}
          />

          <div className="mt-2 space-y-1">
            {settingOptions.map((option) => (
              <MenuButton
                key={option.id}
                active={activeTab === option.id}
                icon={option.icon}
                label={option.label}
                description={option.description}
                onClick={() => setActiveTab(option.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white m-4 rounded-xl border shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}

interface MenuButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

function MenuButton({ active, icon, label, description, onClick }: MenuButtonProps) {
  return (
    <button
      className={`w-full p-2.5 rounded-lg text-left transition-all duration-200 ${
        active 
          ? 'bg-[#FF6B6B] text-white' 
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={active ? 'text-white' : 'text-[#FF6B6B]'}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          <div className={`text-sm ${active ? 'text-white/80' : 'text-gray-500'}`}>
            {description}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
      </div>
    </button>
  );
}

interface ThemeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ThemeButton({ active, onClick, icon, label }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        flex flex-col items-center justify-center gap-3
        hover:scale-[1.02] active:scale-[0.98]
        ${active 
          ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FF6B6B]/5' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}