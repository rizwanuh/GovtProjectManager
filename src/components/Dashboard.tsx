import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { projects as projectsAPI } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    projectsOnHold: 0,
    highPriorityProjects: 0
  });
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = (projectsList: any[]) => {
    return {
      totalProjects: projectsList.length,
      activeProjects: projectsList.filter(p => p.status === 'In Progress' || p.status === 'Planning').length,
      completedProjects: projectsList.filter(p => p.status === 'Completed').length,
      projectsOnHold: projectsList.filter(p => p.status === 'On Hold').length,
      highPriorityProjects: projectsList.filter(p => p.priority === 'High').length
    };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const fetchedProjects = await projectsAPI.list();
        const calculatedStats = calculateStats(fetchedProjects);
        
        setStats(calculatedStats);
        setAllProjects(fetchedProjects);
        setProjectsList(fetchedProjects.slice(0, 4));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          projectsOnHold: 0,
          highPriorityProjects: 0
        });
        setAllProjects([]);
        setProjectsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const displayStats = [
    {
      title: "Total Projects",
      value: stats.totalProjects.toString(),
      change: "+2",
      icon: FolderOpen,
      color: "text-blue-600"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      change: "+1",
      icon: CheckSquare,
      color: "text-green-600"
    },
    {
      title: "Completed",
      value: stats.completedProjects.toString(),
      change: "+3",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "High Priority",
      value: stats.highPriorityProjects.toString(),
      change: "-1",
      icon: Calendar,
      color: "text-orange-600"
    }
  ];

  // Calculate budget usage data for pie chart
  const getBudgetData = () => {
    if (!allProjects.length) return [];

    let totalBudget = 0;
    let usedBudget = 0;

    allProjects.forEach(project => {
      if (project.budget) {
        // Extract numeric value from budget string (e.g., "$50,000" -> 50000)
        const budgetValue = parseFloat(project.budget.replace(/[$,]/g, '')) || 0;
        const progress = project.progress || 0;
        
        totalBudget += budgetValue;
        usedBudget += (budgetValue * progress) / 100;
      }
    });

    const remainingBudget = totalBudget - usedBudget;

    return [
      {
        name: 'Used Budget',
        value: usedBudget,
        color: '#3b82f6'
      },
      {
        name: 'Remaining Budget',
        value: remainingBudget,
        color: '#e5e7eb'
      }
    ];
  };

  const budgetData = getBudgetData();
  const COLORS = ['#3b82f6', '#e5e7eb'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-semibold">{stat.value}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most active projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {projectsList.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge 
                          variant={project.priority === 'High' ? 'destructive' : 
                                 project.priority === 'Medium' ? 'default' : 'secondary'}
                        >
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{project.status}</span>
                        <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={project.progress || 0} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
                {projectsList.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No projects found. Create your first project to get started!</p>
                    <p className="text-sm text-gray-400 mt-1">
                      If you're having connection issues, check your network and try refreshing.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Budget Usage
            </CardTitle>
            <CardDescription>Overview of budget allocation across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 w-48 h-48 rounded-full"></div>
              </div>
            ) : budgetData.length > 0 && budgetData[0].value + budgetData[1].value > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend 
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>
                          {value}: {formatCurrency(entry.payload.value)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Total Budget: {formatCurrency(budgetData[0].value + budgetData[1].value)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Usage: {budgetData[0].value + budgetData[1].value > 0 
                      ? Math.round((budgetData[0].value / (budgetData[0].value + budgetData[1].value)) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No budget data available</p>
                  <p className="text-sm text-gray-400 mt-1">Add projects with budget information to see the chart</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}