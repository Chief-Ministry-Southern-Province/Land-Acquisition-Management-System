import { Calendar, Download, FileText, Filter } from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function Reports() {
  const [reportType, setReportType] = useState('project-progress');

  const reportTypes = [
    {
      id: 'project-progress',
      name: 'Project Progress Report',
      description: 'Detailed progress of all acquisition projects',
    },
    {
      id: 'compensation',
      name: 'Compensation Report',
      description: 'Summary of compensation calculations and payments',
    },
    {
      id: 'owner',
      name: 'Owner Report',
      description: 'List of affected owners and their properties',
    },
    {
      id: 'parcel',
      name: 'Parcel Report',
      description: 'Land parcel details and status',
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Budget utilization and payment tracking',
    },
    {
      id: 'legal',
      name: 'Legal Case Report',
      description: 'Active and closed legal cases',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export system reports
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Report Types */}
        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4">Report Types</h3>
          <div className="space-y-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                  reportType === type.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{type.name}</p>
                    <p
                      className={`mt-1 text-xs ${reportType === type.id ? 'text-white/80' : 'text-muted-foreground'}`}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Parameters */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm">Date Range</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="date"
                      className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                      defaultValue="2024-01-01"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="date"
                      className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                      defaultValue="2024-06-03"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm">Project</label>
                <select className="bg-input-background border-border w-full rounded-lg border px-4 py-2">
                  <option>All Projects</option>
                  <option>PRJ-2024-045 - Southern Highway Expansion</option>
                  <option>PRJ-2024-043 - Mattala Airport Development</option>
                  <option>PRJ-2024-041 - Colombo Metro Rail Extension</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm">District</label>
                <select className="bg-input-background border-border w-full rounded-lg border px-4 py-2">
                  <option>All Districts</option>
                  <option>Galle</option>
                  <option>Colombo</option>
                  <option>Hambantota</option>
                  <option>Kandy</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm">Status</label>
                <select className="bg-input-background border-border w-full rounded-lg border px-4 py-2">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">Export Options</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button className="bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors">
                <Download className="h-5 w-5" />
                <span>Export as PDF</span>
              </button>
              <button className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors">
                <Download className="h-5 w-5" />
                <span>Export as Excel</span>
              </button>
              <button className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors">
                <FileText className="h-5 w-5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">Report Preview</h3>
            <div className="bg-muted/30 text-muted-foreground rounded-lg p-8 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="mb-2 text-lg">
                {reportTypes.find((r) => r.id === reportType)?.name}
              </p>
              <p className="mb-4 text-sm">
                {reportTypes.find((r) => r.id === reportType)?.description}
              </p>
              <p className="text-sm">
                Report preview will be displayed here after applying filters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Reports.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
