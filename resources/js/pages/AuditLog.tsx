import { Calendar, Filter } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import { DataTable } from '../components/ui/DataTable';

export default function AuditLog() {
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-06-03 14:30:25',
      user: 'K.P. Silva',
      action: 'Updated',
      module: 'Projects',
      details: 'Changed status of PRJ-2024-045 to Active',
      ipAddress: '192.168.1.45',
    },
    {
      id: 2,
      timestamp: '2024-06-03 13:15:10',
      user: 'R.D. Silva',
      action: 'Approved',
      module: 'Compensation',
      details: 'Approved COMP-3456 for ₨ 15,000,000',
      ipAddress: '192.168.1.52',
    },
    {
      id: 3,
      timestamp: '2024-06-03 11:45:33',
      user: 'P.K. Bandara',
      action: 'Created',
      module: 'Surveys',
      details: 'Created survey request SUR-2024-156',
      ipAddress: '192.168.1.38',
    },
    {
      id: 4,
      timestamp: '2024-06-03 10:20:18',
      user: 'K.P. Jayasuriya',
      action: 'Updated',
      module: 'Valuations',
      details: 'Submitted valuation VAL-5678',
      ipAddress: '192.168.1.41',
    },
    {
      id: 5,
      timestamp: '2024-06-03 09:30:55',
      user: 'S.A. Fernando',
      action: 'Created',
      module: 'Legal',
      details: 'Registered case LEG-2024-023',
      ipAddress: '192.168.1.48',
    },
    {
      id: 6,
      timestamp: '2024-06-02 16:50:42',
      user: 'Admin User',
      action: 'Created',
      module: 'Users',
      details: 'Added new user USR-008',
      ipAddress: '192.168.1.10',
    },
    {
      id: 7,
      timestamp: '2024-06-02 15:25:19',
      user: 'K.P. Silva',
      action: 'Exported',
      module: 'Reports',
      details: 'Exported Project Progress Report',
      ipAddress: '192.168.1.45',
    },
    {
      id: 8,
      timestamp: '2024-06-02 14:10:37',
      user: 'M.A. Perera',
      action: 'Updated',
      module: 'Parcels',
      details: 'Updated parcel information PCL-8935',
      ipAddress: '192.168.1.55',
    },
    {
      id: 9,
      timestamp: '2024-06-02 11:40:28',
      user: 'R.D. Silva',
      action: 'Created',
      module: 'Compensation',
      details: 'Calculated compensation COMP-3458',
      ipAddress: '192.168.1.52',
    },
    {
      id: 10,
      timestamp: '2024-06-02 09:15:50',
      user: 'K.P. Silva',
      action: 'Updated',
      module: 'Gazette',
      details: 'Published gazette GAZ-2024-045',
      ipAddress: '192.168.1.45',
    },
  ];

  const columns = [
    { key: 'timestamp', label: 'Date & Time', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'details', label: 'Details', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Audit Trail</h1>
        <p className="text-muted-foreground mt-1">
          System activity and change history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Logs
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm">User</label>
            <select
              title="Select User"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
            >
              <option>All Users</option>
              <option>Admin User</option>
              <option>K.P. Silva</option>
              <option>R.D. Silva</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Module</label>
            <select
              title="Select Module"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
            >
              <option>All Modules</option>
              <option>Projects</option>
              <option>Parcels</option>
              <option>Compensation</option>
              <option>Legal</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Date From</label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="date"
                className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                defaultValue="2024-06-01"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">Date To</label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="date"
                className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                defaultValue="2024-06-03"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <DataTable columns={columns} data={auditLogs} />
    </div>
  );
}

AuditLog.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
