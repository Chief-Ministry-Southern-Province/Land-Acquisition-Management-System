import {
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  FolderKanban,
  Scale,
  Map,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import type { ReactNode } from 'react';

export default function Dashboard() {
  const { t } = useTranslation();
  const stats = [
    {
      title: t('total_projects'),
      value: '48',
      icon: FolderKanban,
      color: 'primary' as const,
    },
    {
      title: t('active_projects'),
      value: '24',
      icon: Activity,
      color: 'info' as const,
      trend: { value: '+12.5%', isPositive: true },
    },
    {
      title: t('completed_projects'),
      value: '18',
      icon: CheckCircle,
      color: 'success' as const,
    },
    {
      title: t('pending_approvals'),
      value: '15',
      icon: Clock,
      color: 'warning' as const,
    },
    {
      title: t('pending_payments'),
      value: '₨ 45.2M',
      icon: DollarSign,
      color: 'accent' as const,
    },
    {
      title: t('court_cases'),
      value: '7',
      icon: Scale,
      color: 'primary' as const,
    },
    {
      title: t('land_parcels'),
      value: '1,247',
      icon: Map,
      color: 'secondary' as const,
    },
    {
      title: t('affected_owners'),
      value: '3,856',
      icon: Users,
      color: 'info' as const,
    },
  ];

  const projectProgressData = [
    { name: 'Highway Expansion', progress: 85, budget: 250 },
    { name: 'Airport Development', progress: 60, budget: 420 },
    { name: 'Railway Extension', progress: 45, budget: 180 },
    { name: 'Urban Infrastructure', progress: 72, budget: 320 },
    { name: 'Port Expansion', progress: 30, budget: 560 },
  ];

  const compensationData = [
    { month: t('jan'), amount: 24.5 },
    { month: t('feb'), amount: 32.1 },
    { month: t('mar'), amount: 28.7 },
    { month: t('apr'), amount: 45.2 },
    { month: t('may'), amount: 38.9 },
    { month: t('jun'), amount: 52.3 },
  ];

  const statusDistributionData = [
    { name: t('active'), value: 24, color: '#0288d1' },
    { name: t('completed'), value: 18, color: '#2E7D32' },
    { name: t('pending'), value: 6, color: '#FF9800' },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: "Project PRJ-2024-045 status updated to 'Active'",
      user: 'Land Officer',
      time: '2 hours ago',
      type: 'update',
    },
    {
      id: 2,
      activity: 'Compensation payment approved for Owner OWN-1247',
      user: 'Finance Officer',
      time: '3 hours ago',
      type: 'approval',
    },
    {
      id: 3,
      activity: 'Survey completed for Parcel PCL-8934',
      user: 'Survey Officer',
      time: '5 hours ago',
      type: 'completion',
    },
    {
      id: 4,
      activity: 'Legal case filed for Parcel PCL-7821',
      user: 'Legal Officer',
      time: '1 day ago',
      type: 'alert',
    },
    {
      id: 5,
      activity: 'Valuation report submitted for Project PRJ-2024-043',
      user: 'Valuation Officer',
      time: '1 day ago',
      type: 'submission',
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      task: 'Review valuation report for PCL-8934',
      priority: 'High',
      dueDate: '2026-06-05',
      assignedTo: 'Valuation Officer',
    },
    {
      id: 2,
      task: 'Approve compensation for OWN-1247',
      priority: 'Medium',
      dueDate: '2026-06-07',
      assignedTo: 'Assistant Secretary',
    },
    {
      id: 3,
      task: 'Complete survey for PCL-9012',
      priority: 'High',
      dueDate: '2026-06-06',
      assignedTo: 'Survey Officer',
    },
    {
      id: 4,
      task: 'Update project documentation',
      priority: 'Low',
      dueDate: '2026-06-10',
      assignedTo: 'Data Entry Operator',
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      item: 'Gazette Notice Publication - PRJ-2024-045',
      date: '2026-06-08',
      status: 'pending',
    },
    {
      id: 2,
      item: 'Court Hearing - Case LEG-2024-023',
      date: '2026-06-12',
      status: 'scheduled',
    },
    {
      id: 3,
      item: 'Compensation Payment - OWN-1248 to OWN-1267',
      date: '2026-06-15',
      status: 'pending',
    },
  ];

  const activityColumns = [
    { key: 'activity', label: 'Activity', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
  ];

  const taskColumns = [
    { key: 'task', label: 'Task', sortable: true },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: string) => (
        <StatusBadge
          status={
            value === 'High'
              ? 'danger'
              : value === 'Medium'
                ? 'warning'
                : 'default'
          }
        />
      ),
    },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', sortable: true },
  ];

  const deadlineColumns = [
    { key: 'item', label: 'Item', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1>{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboaard_sub_title')}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acquisition Progress Chart */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">{t('bar_graph_title')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#1565C0" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">{t('pie_chart_title')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Compensation Payments */}
        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">{t('line_chart_title')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={compensationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2E7D32"
                strokeWidth={2}
                name="Amount (M)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div>
          <h3 className="mb-4">{t('recent_activities')}</h3>
          <DataTable
            columns={activityColumns}
            data={recentActivities}
            searchable={false}
            filterable={false}
            exportable={false}
            pageSize={5}
          />
        </div>

        {/* Pending Tasks */}
        <div>
          <h3 className="mb-4">{t('pending_tasks')}</h3>
          <DataTable
            columns={taskColumns}
            data={pendingTasks}
            searchable={false}
            filterable={false}
            exportable={false}
            pageSize={5}
          />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <h3 className="mb-4">{t('upcoming_deadlines')}</h3>
        <DataTable
          columns={deadlineColumns}
          data={upcomingDeadlines}
          searchable={false}
          filterable={false}
          exportable={false}
          pageSize={5}
        />
      </div>
    </div>
  );
}

Dashboard.layout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;
