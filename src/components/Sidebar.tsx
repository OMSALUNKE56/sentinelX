import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Globe,
  QrCode,
  Mic,
  Video,
  FileSearch,
  History,
  BarChart3,
  GraduationCap,
  Settings,
  Server,
  Info,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  collapsed,
  setCollapsed,
}) => {
  const navSections = [
    {
      title: 'CORE WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analyze', label: 'Threat Workbench', icon: Layers, badge: 'Unified' },
      ],
    },
    {
      title: 'SPECIALIZED DETECTORS',
      items: [
        { id: 'scanner_text', label: 'Text & Message', icon: FileText },
        { id: 'scanner_url', label: 'URL Phishing', icon: Globe },
        { id: 'scanner_qr', label: 'QR Code / Quishing', icon: QrCode },
        { id: 'scanner_voice', label: 'Voice Spoofing', icon: Mic },
        { id: 'scanner_deepfake', label: 'Deepfake Forensics', icon: Video },
      ],
    },
    {
      title: 'INTELLIGENCE & AUDIT',
      items: [
        { id: 'results', label: 'Analysis Report', icon: FileSearch },
        { id: 'history', label: 'Audit History', icon: History },
        { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
        { id: 'education', label: 'Security Education', icon: GraduationCap },
      ],
    },
    {
      title: 'SYSTEM & ACADEMIC',
      items: [
        { id: 'settings', label: 'Settings & Privacy', icon: Settings },
        { id: 'status', label: 'System Telemetry', icon: Server },
        { id: 'about', label: 'Project Architecture', icon: Info },
        { id: 'help', label: 'Documentation', icon: HelpCircle },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-30 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        {/* Mobile Header in drawer */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">SentinelX Navigation</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {!collapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
                  {section.title}
                </div>
              )}
              {collapsed && (
                <div className="h-2" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
                      } rounded-lg text-xs font-medium transition group relative ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800/90 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition ${
                            isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40 shrink-0">
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-600 dark:bg-cyan-400 rounded-r" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Collapse Toggle & Engine Status */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950">
          {!collapsed ? (
            <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span>Fusion v1.0</span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="hidden lg:flex p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full hidden lg:flex items-center justify-center p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
