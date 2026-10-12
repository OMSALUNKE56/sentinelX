import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AnalyzeUnifiedPage } from './pages/AnalyzeUnifiedPage.js';
import { TextScannerPage } from './pages/TextScannerPage.js';
import { UrlScannerPage } from './pages/UrlScannerPage.js';
import { QrScannerPage } from './pages/QrScannerPage.js';
import { VoiceScannerPage } from './pages/VoiceScannerPage.js';
import { DeepfakeScannerPage } from './pages/DeepfakeScannerPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ThreatAnalyticsPage } from './pages/ThreatAnalyticsPage.js';
import { SecurityEducationPage } from './pages/SecurityEducationPage.js';
import { SettingsPrivacyPage } from './pages/SettingsPrivacyPage.js';
import { SystemStatusPage } from './pages/SystemStatusPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { HelpPage } from './pages/HelpPage.js';
import { AnalysisReport } from './types/sentinel.js';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const handleAnalysisComplete = (report: AnalysisReport) => {
    setCurrentReport(report);
    setCurrentView('results');
  };

  const handleSelectReport = (report: AnalysisReport) => {
    setCurrentReport(report);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300">
      {/* Top Navigation Bar with Search, Breadcrumbs, Theme Toggle, Notifications, User Menu */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onSelectReport={handleSelectReport}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          {currentView === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentView}
              onSelectReport={handleSelectReport}
            />
          )}

          {currentView === 'analyze' && (
            <AnalyzeUnifiedPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'scanner_text' && (
            <TextScannerPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'scanner_url' && (
            <UrlScannerPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'scanner_qr' && (
            <QrScannerPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'scanner_voice' && (
            <VoiceScannerPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'scanner_deepfake' && (
            <DeepfakeScannerPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentView === 'results' && (
            <ResultsPage
              report={currentReport}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'history' && (
            <HistoryPage
              onSelectReport={handleSelectReport}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'analytics' && <ThreatAnalyticsPage />}

          {currentView === 'education' && <SecurityEducationPage />}

          {currentView === 'settings' && <SettingsPrivacyPage />}

          {currentView === 'status' && <SystemStatusPage />}

          {currentView === 'about' && <AboutPage />}

          {currentView === 'help' && <HelpPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
