/**
 * University Clearance Management System
 * Frontend Application
 */

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  CheckCircle,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  Bell,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import './App.css';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'student' | 'hod' | 'department_officer' | 'finance_officer' | 'library_officer' | 'transport_officer';
  department?: string;
  avatar?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  type: string;
  contactInfo: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  clearanceConfig: {
    isRequired: boolean;
    order: number;
  };
}

interface ClearanceStatus {
  department: Department;
  status: 'pending' | 'in_review' | 'cleared' | 'rejected' | 'on_hold';
  remarks?: string;
  clearedAt?: string;
  dueAmount?: number;
}

interface ClearanceRequest {
  id: string;
  requestId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber: string;
    email: string;
    department: string;
  };
  requestType: string;
  status: string;
  progress: {
    percentage: number;
    totalDepartments: number;
    clearedDepartments: number;
  };
  departmentStatuses: ClearanceStatus[];
  createdAt: string;
  certificate?: {
    issued: boolean;
    certificateNumber?: string;
  };
}

// Mock Data
const mockUser: User = {
  id: '1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@university.edu.pk',
  role: 'admin'
};

const mockDepartments: Department[] = [
  { id: '1', name: 'Computer Science', code: 'CS', type: 'academic', contactInfo: { email: 'cs@university.edu.pk', phone: '+92-51-1234567', whatsapp: '+92-300-1234567' }, clearanceConfig: { isRequired: true, order: 1 } },
  { id: '2', name: 'Software Engineering', code: 'SE', type: 'academic', contactInfo: { email: 'se@university.edu.pk', phone: '+92-51-1234568' }, clearanceConfig: { isRequired: true, order: 2 } },
  { id: '3', name: 'Finance Department', code: 'FIN', type: 'finance', contactInfo: { email: 'finance@university.edu.pk', phone: '+92-51-1234569', whatsapp: '+92-300-1234569' }, clearanceConfig: { isRequired: true, order: 3 } },
  { id: '4', name: 'Library', code: 'LIB', type: 'library', contactInfo: { email: 'library@university.edu.pk', phone: '+92-51-1234570' }, clearanceConfig: { isRequired: true, order: 4 } },
  { id: '5', name: 'Transport Office', code: 'TRN', type: 'transport', contactInfo: { email: 'transport@university.edu.pk', phone: '+92-51-1234571' }, clearanceConfig: { isRequired: false, order: 5 } },
];

const mockClearanceRequests: ClearanceRequest[] = [
  {
    id: '1',
    requestId: 'CLR-ABC123',
    student: { id: 's1', firstName: 'Ali', lastName: 'Ahmad', registrationNumber: 'FA20-BCS-001', email: 'ali@student.edu.pk', department: 'Computer Science' },
    requestType: 'graduation',
    status: 'cleared',
    progress: { percentage: 100, totalDepartments: 5, clearedDepartments: 5 },
    departmentStatuses: [
      { department: mockDepartments[0], status: 'cleared', clearedAt: '2024-01-10' },
      { department: mockDepartments[1], status: 'cleared', clearedAt: '2024-01-11' },
      { department: mockDepartments[2], status: 'cleared', clearedAt: '2024-01-12' },
      { department: mockDepartments[3], status: 'cleared', clearedAt: '2024-01-13' },
      { department: mockDepartments[4], status: 'cleared', clearedAt: '2024-01-14' },
    ],
    createdAt: '2024-01-01',
    certificate: { issued: true, certificateNumber: 'CERT-2024-001' }
  },
  {
    id: '2',
    requestId: 'CLR-DEF456',
    student: { id: 's2', firstName: 'Sara', lastName: 'Khalid', registrationNumber: 'FA20-BCS-002', email: 'sara@student.edu.pk', department: 'Computer Science' },
    requestType: 'graduation',
    status: 'in_progress',
    progress: { percentage: 60, totalDepartments: 5, clearedDepartments: 3 },
    departmentStatuses: [
      { department: mockDepartments[0], status: 'cleared', clearedAt: '2024-01-15' },
      { department: mockDepartments[1], status: 'cleared', clearedAt: '2024-01-16' },
      { department: mockDepartments[2], status: 'cleared', clearedAt: '2024-01-17' },
      { department: mockDepartments[3], status: 'in_review' },
      { department: mockDepartments[4], status: 'pending' },
    ],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    requestId: 'CLR-GHI789',
    student: { id: 's3', firstName: 'Usman', lastName: 'Farooq', registrationNumber: 'FA20-BSE-001', email: 'usman@student.edu.pk', department: 'Software Engineering' },
    requestType: 'graduation',
    status: 'rejected',
    progress: { percentage: 40, totalDepartments: 5, clearedDepartments: 2 },
    departmentStatuses: [
      { department: mockDepartments[0], status: 'cleared', clearedAt: '2024-01-12' },
      { department: mockDepartments[1], status: 'cleared', clearedAt: '2024-01-13' },
      { department: mockDepartments[2], status: 'rejected', remarks: 'Outstanding dues: Rs. 25,000', dueAmount: 25000 },
      { department: mockDepartments[3], status: 'pending' },
      { department: mockDepartments[4], status: 'pending' },
    ],
    createdAt: '2024-01-05'
  }
];

// Components

const Sidebar = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  userRole 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  userRole: string;
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'student', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'hod'] },
    { id: 'departments', label: 'Departments', icon: Building2, roles: ['admin'] },
    { id: 'requests', label: 'Clearance Requests', icon: FileText, roles: ['admin', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'hod'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">UniClearance</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <nav className="p-4 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ 
  onMenuClick, 
  user 
}: { 
  onMenuClick: () => void; 
  user: User;
}) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            University Clearance System
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{user.firstName} {user.lastName}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: { title: string; value: string | number; icon: any; trend?: string; trendUp?: boolean }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {trend && (
            <p className={`text-sm mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    cleared: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_review: 'bg-blue-100 text-blue-700 border-blue-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <Badge variant="outline" className={styles[status] || styles.draft}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

const DashboardView = ({ userRole: _userRole }: { userRole: string }) => {
  const stats = [
    { title: 'Total Students', value: '1,234', icon: GraduationCap, trend: '12% from last month', trendUp: true },
    { title: 'Clearance Requests', value: '456', icon: FileText, trend: '8% from last month', trendUp: true },
    { title: 'Pending Approvals', value: '78', icon: Clock, trend: '5% from last week', trendUp: false },
    { title: 'Cleared This Month', value: '89', icon: CheckCircle, trend: '15% from last month', trendUp: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Overview of the clearance system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clearance Requests</CardTitle>
            <CardDescription>Latest clearance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClearanceRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{request.student.firstName} {request.student.lastName}</p>
                    <p className="text-sm text-gray-500">{request.student.registrationNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Status</CardTitle>
            <CardDescription>Clearance status by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDepartments.map((dept) => (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    <span className="text-sm text-gray-500">24 pending</span>
                  </div>
                  <Progress value={Math.random() * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ClearanceRequestsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = mockClearanceRequests.filter(request => {
    const matchesSearch = 
      request.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clearance Requests</h2>
          <p className="text-gray-500">Manage and track clearance requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by name, registration number, or request ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.requestId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.student.firstName} {request.student.lastName}</p>
                      <p className="text-sm text-gray-500">{request.student.registrationNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.student.department}</TableCell>
                  <TableCell className="capitalize">{request.requestType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={request.progress.percentage} className="w-20 h-2" />
                      <span className="text-sm text-gray-500">{request.progress.percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const DepartmentsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500">Manage departments and their clearance settings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{dept.code}</p>
                </div>
                <Badge variant="outline" className="capitalize">{dept.type}</Badge>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{dept.contactInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{dept.contactInfo.phone}</span>
                </div>
                {dept.contactInfo.whatsapp && (
                  <a 
                    href={`https://wa.me/${dept.contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Clearance Required</span>
                  <Badge variant={dept.clearanceConfig.isRequired ? 'default' : 'secondary'}>
                    {dept.clearanceConfig.isRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user] = useState<User>(mockUser);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView userRole={user.role} />;
      case 'requests':
        return <ClearanceRequestsView />;
      case 'departments':
        return <DepartmentsView />;
      case 'students':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Student management module coming soon</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics module coming soon</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>User management module coming soon</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <DashboardView userRole={user.role} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
      />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;