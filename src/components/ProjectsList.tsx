import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { projects as projectsAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import { Progress } from './ui/progress';

interface ProjectsListProps {
  onCreateProject: () => void;
  onEditProject: (project: any) => void;
  refreshKey?: number;
  projectType?: 'all' | 'expenditure' | 'revenue';
  title?: string;
  description?: string;
}

export default function ProjectsList({ 
  onCreateProject, 
  onEditProject, 
  projectType = 'all',
  title = 'Projects',
  description = 'Manage and track all your projects'
}: ProjectsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const projectsList = await projectsAPI.list();
      setProjects(projectsList);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(projectId);
      loadProjects(); // Reload to reflect changes
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    // Filter by project type based on budget characteristics
    const matchesProjectType = (() => {
      if (projectType === 'all') return true;
      if (projectType === 'expenditure') {
        // Expenditure projects: maintenance, safety, infrastructure, training
        return ['maintenance', 'safety', 'infrastructure', 'training'].includes(project.category);
      }
      if (projectType === 'revenue') {
        // Revenue projects: operations, technology
        return ['operations', 'technology'].includes(project.category);
      }
      return true;
    })();
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProjectType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>{title} ({filteredProjects.length})</CardTitle>
          <CardDescription>
            {projectType === 'expenditure' ? 'Projects focused on operational costs and infrastructure investments' :
             projectType === 'revenue' ? 'Projects designed to generate income and business growth' :
             'Complete overview of your project portfolio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {project.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={project.progress} className="w-[60px] h-2" />
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.manager}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{project.teamSize}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>{project.budget}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEditProject(project)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {projects.length === 0 ? (
                <div>
                  <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No projects found. Create your first project to get started!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    If you're having connection issues, check your network and try refreshing.
                  </p>
                </div>
              ) : (
                <div>
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No projects match your current filters.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}