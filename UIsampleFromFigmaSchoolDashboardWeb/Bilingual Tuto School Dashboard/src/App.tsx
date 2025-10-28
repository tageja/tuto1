import React, { useState } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { NavSidebar } from './components/NavSidebar';
import { TopBar } from './components/TopBar';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { ParentDashboard } from './components/pages/ParentDashboard';
import { AnnouncementsPage } from './components/pages/AnnouncementsPage';
import { AttendancePage } from './components/pages/AttendancePage';
import { HomeworkPage } from './components/pages/HomeworkPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { MessagesPage } from './components/pages/MessagesPage';
import { ProgressPage } from './components/pages/ProgressPage';
import { PaymentsPage } from './components/pages/PaymentsPage';
import { EventsPage } from './components/pages/EventsPage';
import { DailyActivitiesPage } from './components/pages/DailyActivitiesPage';
import { PhotoAlbumsPage } from './components/pages/PhotoAlbumsPage';
import { ClassesPage } from './components/pages/ClassesPage';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { role, setRole } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return role === 'admin' ? <AdminDashboard /> : <ParentDashboard />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'homework':
        return <HomeworkPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dailyActivities':
        return <DailyActivitiesPage />;
      case 'messages':
        return <MessagesPage />;
      case 'photoAlbums':
        return <PhotoAlbumsPage />;
      case 'classes':
        return <ClassesPage />;
      case 'teachers':
        return <TeachersPlaceholder />;
      case 'progress':
        return <ProgressPage />;
      case 'events':
        return <EventsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'health':
        return <HealthPlaceholder />;
      case 'extracurricular':
        return <ExtracurricularPlaceholder />;
      case 'library':
        return <LibraryPlaceholder />;
      default:
        return role === 'admin' ? <AdminDashboard /> : <ParentDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto">
          {/* Role Switcher (for demo purposes) */}
          <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Demo Mode - Switch Role:</span>
              <Button
                size="sm"
                variant={role === 'admin' ? 'default' : 'outline'}
                onClick={() => {
                  setRole('admin');
                  setCurrentPage('dashboard');
                }}
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant={role === 'parent' ? 'default' : 'outline'}
                onClick={() => {
                  setRole('parent');
                  setCurrentPage('dashboard');
                }}
              >
                Parent
              </Button>
            </div>
          </div>
          
          {renderPage()}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">T</span>
          </div>
          <h2 className="mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm">This page is available in the full demo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeachersPlaceholder() {
  return (
    <PlaceholderPage
      title="Teachers Directory"
      description="Browse teacher profiles with subject specializations, experience levels, ratings, and schedules."
    />
  );
}

function HealthPlaceholder() {
  return (
    <PlaceholderPage
      title="Health & Medicine"
      description="Health records management with medicine reminders, dosage tracking, and medical appointment history."
    />
  );
}

function ExtracurricularPlaceholder() {
  return (
    <PlaceholderPage
      title="Extracurricular Activities"
      description="Browse and enroll in extracurricular activities with schedules, locations, and photo previews."
    />
  );
}

function LibraryPlaceholder() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center mx-auto mb-4 relative">
            <span className="text-white text-2xl">📚</span>
            <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs">
              Soon
            </div>
          </div>
          <h2 className="mb-2">Library & Stories</h2>
          <p className="text-muted-foreground mb-6">
            Digital library with educational stories, videos, and interactive learning resources.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0B5FFF]/10 to-[#6366F1]/10 border border-[#0B5FFF]/20">
            <span className="text-sm">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
