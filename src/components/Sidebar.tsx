import { 
  LayoutDashboard, 
  FolderOpen, 
  BarChart3,
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const projectSubItems = [
    { id: 'projects', label: 'All Projects', icon: FolderOpen },
    { id: 'expenditure-projects', label: 'Expenditure Projects', icon: TrendingDown },
    { id: 'revenue-projects', label: 'Revenue Projects', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <div className="p-6">
        <Button className="w-full mb-6" onClick={() => setActiveView('new-project')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
          
          {/* Projects Section with Subcategories */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            >
              {isProjectsExpanded ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </Button>
            
            {isProjectsExpanded && (
              <div className="ml-6 space-y-1">
                {projectSubItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeView === item.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setActiveView(item.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setActiveView('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </aside>
  );
}