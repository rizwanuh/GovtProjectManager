// Mock data and utilities for local state management

export const generateId = () => {
  return 'local_' + Math.random().toString(36).substr(2, 9);
};

export const sampleProjects = [
  {
    id: 'project-1',
    name: "Aircraft Maintenance System",
    nameOfWork: "Aircraft Maintenance System",
    description: "Complete overhaul of maintenance tracking system",
    status: "In Progress",
    priority: "High",
    progress: 75,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    budget: "$125,000",
    manager: "John Doe",
    category: "maintenance",
    projectType: "expenditure",
    teamSize: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-2',
    name: "Flight Scheduling Platform",
    nameOfWork: "Flight Scheduling Platform",
    description: "New platform for efficient flight scheduling",
    status: "In Progress",
    priority: "Medium", 
    progress: 45,
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    budget: "$85,000",
    manager: "Jane Smith",
    category: "operations",
    projectType: "revenue",
    teamSize: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-3',
    name: "Safety Management System",
    description: "Implementation of new safety protocols",
    status: "Planning",
    priority: "High",
    progress: 20,
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    budget: "$95,000",
    manager: "Mike Johnson",
    category: "safety",
    projectType: "expenditure",
    teamSize: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-4',
    name: "Crew Training Portal",
    description: "Online training platform for crew members",
    status: "Completed",
    priority: "Low",
    progress: 100,
    startDate: "2023-12-01",
    endDate: "2024-01-30",
    budget: "$45,000",
    manager: "Sarah Wilson",
    category: "training",
    projectType: "expenditure",
    teamSize: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-5',
    name: "Airport Infrastructure Upgrade",
    description: "Modernization of terminal facilities",
    status: "On Hold",
    priority: "Critical",
    progress: 30,
    startDate: "2024-01-01",
    endDate: "2024-04-01",
    budget: "$250,000",
    manager: "John Doe",
    category: "infrastructure",
    projectType: "expenditure",
    teamSize: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const calculateStats = (projects: any[]) => {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'In Progress').length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    projectsOnHold: projects.filter(p => p.status === 'On Hold').length,
    highPriorityProjects: projects.filter(p => p.priority === 'High' || p.priority === 'Critical').length
  };
};

// Local storage utilities
export const storage = {
  getProjects: () => {
    try {
      const stored = localStorage.getItem('pm_projects');
      return stored ? JSON.parse(stored) : sampleProjects;
    } catch {
      return sampleProjects;
    }
  },
  
  setProjects: (projects: any[]) => {
    try {
      localStorage.setItem('pm_projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  },
  
  addProject: (project: any) => {
    const projects = storage.getProjects();
    const newProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(newProject);
    storage.setProjects(projects);
    return newProject;
  },
  
  updateProject: (id: string, updates: any) => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      storage.setProjects(projects);
      return projects[index];
    }
    return null;
  },
  
  deleteProject: (id: string) => {
    const projects = storage.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    storage.setProjects(filteredProjects);
    return true;
  }
};