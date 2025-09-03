import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsList from './components/ProjectsList';
import ProjectForm from './components/ProjectForm';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [editingProject, setEditingProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleCreateProject = () => {
    setEditingProject(null);
    setActiveView('new-project');
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setActiveView('edit-project');
  };

  const handleCancelForm = () => {
    setEditingProject(null);
    setActiveView('projects');
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh in components that use this key
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard key={refreshKey} />;
      case 'projects':
        return (
          <ProjectsList 
            key={refreshKey}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
          />
        );
      case 'new-project':
        return <ProjectForm onCancel={handleCancelForm} onSuccess={handleFormSuccess} />;
      case 'edit-project':
        return <ProjectForm onCancel={handleCancelForm} onSuccess={handleFormSuccess} project={editingProject} />;
      case 'expenditure-projects':
        return (
          <ProjectsList 
            key={`expenditure-${refreshKey}`}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            projectType="expenditure"
            title="Expenditure Projects"
            description="Projects that involve spending and operational costs"
          />
        );
      case 'revenue-projects':
        return (
          <ProjectsList 
            key={`revenue-${refreshKey}`}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            projectType="revenue"
            title="Revenue Projects"
            description="Projects that generate income and profits"
          />
        );
      case 'reports':
        return (
          <div className="p-6">
            <h1>Reports</h1>
            <p className="text-gray-600">Reports and analytics coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1>Settings</h1>
            <p className="text-gray-600">Application settings coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto bg-white">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}