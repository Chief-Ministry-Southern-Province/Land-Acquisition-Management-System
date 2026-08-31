import { Calendar, Download, FileText, Filter, Printer, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import api from '@/services/api';
import { getProjects } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

const CHART_COLORS = ['#2E7D32', '#d32f2f', '#fbc02d', '#0288d1', '#7b1fa2', '#c2185b'];

export default function Reports() {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('project-progress');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Filters State
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  const [selectedProjectId, setSelectedProjectId] = useState('All Projects');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  const reportTypes = [
    {
      id: 'project-progress',
      name: t('report_project_progress', 'Project Progress Report'),
      description: t('report_project_progress_desc', 'Detailed progress of all acquisition projects'),
    },
    {
      id: 'compensation',
      name: t('report_compensation', 'Compensation Report'),
      description: t('report_compensation_desc', 'Summary of compensation calculations and payments'),
    },
    {
      id: 'owner',
      name: t('report_owner', 'Owner Report'),
      description: t('report_owner_desc', 'List of affected owners and their properties'),
    },
    {
      id: 'parcel',
      name: t('report_parcel', 'Parcel Report'),
      description: t('report_parcel_desc', 'Land parcel details and status'),
    },
    {
      id: 'financial',
      name: t('report_financial', 'Financial Report'),
      description: t('report_financial_desc', 'Budget utilization and payment tracking'),
    },
    {
      id: 'legal',
      name: t('report_legal', 'Legal Case Report'),
      description: t('report_legal_desc', 'Active and closed legal cases'),
    },
  ];

  // Fetch Projects List on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects for reports:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch Report Data
  useEffect(() => {
    let active = true;
    const fetchReport = async () => {
      try {
        setLoadingReport(true);
        const response = await api.get('/api/reports', {
          params: {
            type: reportType,
            project_id: selectedProjectId,
            district: selectedDistrict,
            status: selectedStatus,
            date_from: dateFrom,
            date_to: dateTo
          }
        });

        if (active) {
          setReportData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        if (active) {
          setLoadingReport(false);
        }
      }
    };

    fetchReport();

    return () => {
      active = false;
    };
  }, [reportType, selectedProjectId, selectedDistrict, selectedStatus, dateFrom, dateTo]);

  // Export handlers
  const handleExport = (format: string) => {
    const params = new URLSearchParams({
      type: reportType,
      format,
      project_id: selectedProjectId,
      district: selectedDistrict,
      status: selectedStatus,
      date_from: dateFrom,
      date_to: dateTo
    });
    window.open(`/api/reports/export?${params.toString()}`, '_blank');
  };

  const renderBadge = (cellValue: string) => {
    if (cellValue.startsWith('badge:')) {
      const parts = cellValue.split(':');
      const badgeType = parts[1] || 'neutral';
      const badgeText = parts[2] || '';
      
      let badgeClasses = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase ';

      if (badgeType === 'success') {
badgeClasses += 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
} else if (badgeType === 'warning') {
badgeClasses += 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
} else if (badgeType === 'danger') {
badgeClasses += 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
} else if (badgeType === 'info') {
badgeClasses += 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
} else {
badgeClasses += 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
}

      return <span className={badgeClasses}>{badgeText}</span>;
    }

    return cellValue;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
      {/* Page Title */}
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
          {t('reports_title', 'Reports')}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
          {t('reports_subtitle', 'Generate, preview, and export custom land acquisition reports')}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        {/* Left Column: Report Types */}
        <div className="bg-card border-border rounded-xl border p-4 shadow-sm">
          <h3 className="text-foreground text-sm font-bold uppercase tracking-wider mb-4 px-1">
            {t('report_types_title', 'Report Types')}
          </h3>
          <div className="space-y-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`w-full rounded-lg px-3 py-3 text-left transition-all ${
                  reportType === type.id
                    ? 'bg-[#2E7D32] text-white shadow-sm font-bold'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide">{type.name}</p>
                    <p
                      className={`mt-1 text-[10px] leading-normal font-normal ${
                        reportType === type.id ? 'text-white/80' : 'text-muted-foreground/80'
                      }`}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Filters and Preview */}
        <div className="space-y-6 lg:col-span-3">
          {/* Report Filters */}
          <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-3">
              <Filter className="h-4 w-4 text-[#2E7D32]" />
              {t('report_filters_title', 'Report Parameters & Filters')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Date Range */}
              <div className="md:col-span-2">
                <label className="text-muted-foreground block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t('filter_date_range', 'Date Range')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-input-background border-border text-foreground w-full rounded-lg border py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="bg-input-background border-border text-foreground w-full rounded-lg border py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="text-muted-foreground block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t('filter_project', 'Project')}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={loadingProjects}
                  className="bg-input-background border-border text-foreground w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32] disabled:opacity-60"
                >
                  <option value="All Projects">{t('all_projects', 'All Projects')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_id} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="text-muted-foreground block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t('filter_district', 'District')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-input-background border-border text-foreground w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="All Districts">{t('all_districts', 'All Districts')}</option>
                  <option value="Ampara">{t('ampara', 'Ampara')}</option>
                  <option value="Anuradhapura">{t('anuradhapura', 'Anuradhapura')}</option>
                  <option value="Badulla">{t('badulla', 'Badulla')}</option>
                  <option value="Batticaloa">{t('batticaloa', 'Batticaloa')}</option>
                  <option value="Colombo">{t('colombo', 'Colombo')}</option>
                  <option value="Galle">{t('galle', 'Galle')}</option>
                  <option value="Gampaha">{t('gampaha', 'Gampaha')}</option>
                  <option value="Hambantota">{t('hambantota', 'Hambantota')}</option>
                  <option value="Jaffna">{t('jaffna', 'Jaffna')}</option>
                  <option value="Kalutara">{t('kalutara', 'Kalutara')}</option>
                  <option value="Kandy">{t('kandy', 'Kandy')}</option>
                  <option value="Kegalle">{t('kegalle', 'Kegalle')}</option>
                  <option value="Kilinochchi">{t('kilinochchi', 'Kilinochchi')}</option>
                  <option value="Kurunegala">{t('kurunegala', 'Kurunegala')}</option>
                  <option value="Mannar">{t('mannar', 'Mannar')}</option>
                  <option value="Matale">{t('matale', 'Matale')}</option>
                  <option value="Matara">{t('matara', 'Matara')}</option>
                  <option value="Monaragala">{t('monaragala', 'Monaragala')}</option>
                  <option value="Mullaitivu">{t('mullaitivu', 'Mullaitivu')}</option>
                  <option value="Nuwara Eliya">{t('nuwara_eliya', 'Nuwara Eliya')}</option>
                  <option value="Polonnaruwa">{t('polonnaruwa', 'Polonnaruwa')}</option>
                  <option value="Puttalam">{t('puttalam', 'Puttalam')}</option>
                  <option value="Ratnapura">{t('ratnapura', 'Ratnapura')}</option>
                  <option value="Trincomalee">{t('trincomalee', 'Trincomalee')}</option>
                  <option value="Vavuniya">{t('vavuniya', 'Vavuniya')}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-muted-foreground block text-xs font-bold uppercase tracking-wider mb-1.5">
                  {t('filter_status', 'Status')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-input-background border-border text-foreground w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="All Statuses">{t('all_statuses', 'All Statuses')}</option>
                  <option value="Active">{t('status_active', 'Active')}</option>
                  <option value="Completed">{t('status_completed', 'Completed / Acquired')}</option>
                  <option value="Pending">{t('status_pending', 'Pending / Query')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-3">
              {t('export_options_title', 'Export Reports')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={loadingReport || !reportData}
                className="bg-[#2E7D32] hover:bg-[#2E7D32]/90 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                <span>{t('export_pdf', 'Export as PDF')}</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={loadingReport || !reportData}
                className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold text-foreground transition-all disabled:opacity-40"
              >
                <Download className="h-4 w-4 text-[#2E7D32]" />
                <span>{t('export_excel', 'Export as Excel')}</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={loadingReport || !reportData}
                className="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold text-foreground transition-all disabled:opacity-40"
              >
                <Printer className="h-4 w-4 text-[#2E7D32]" />
                <span>{t('print_report', 'Print Report')}</span>
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-card border-border rounded-xl border p-6 shadow-sm min-h-[400px] flex flex-col justify-start relative">
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider mb-5">
              {t('report_preview_title', 'Report Preview')}
            </h3>

            {loadingReport ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/60 backdrop-blur-xs rounded-xl z-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#2E7D32]" />
                <span className="text-xs font-semibold text-slate-500">{t('loading_report_preview', 'Loading report preview...')}</span>
              </div>
            ) : null}

            {reportData ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Stats Cards summary grid */}
                {reportData.summary && Object.keys(reportData.summary).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(reportData.summary).map(([key, val]) => (
                      <div key={key} className="bg-muted/30 border-border border p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {key}
                        </span>
                        <span className="text-lg font-bold text-foreground block mt-1">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Report Charts Visualization */}
                {reportData.chart_data && reportData.chart_data.length > 0 && (
                  <div className="bg-muted/20 border-border border p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      {t('data_visualization', 'Data Visualization')}
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {reportType === 'project-progress' ? (
                          <BarChart data={reportData.chart_data}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <RechartsLegend verticalAlign="top" height={36} />
                            <Bar dataKey="Total" fill="#2E7D32" name={t('total_parcels', 'Total Parcels')} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Acquired" fill="#d32f2f" name={t('acquired_parcels', 'Acquired')} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie
                              data={reportData.chart_data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {reportData.chart_data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Table Data Preview */}
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        {reportData.headers && reportData.headers.map((header: string, index: number) => (
                          <th key={index} className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {reportData.rows && reportData.rows.length > 0 ? (
                        reportData.rows.map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex} className="hover:bg-muted/20 text-foreground">
                            {row.map((cell: any, cellIndex: number) => (
                              <td key={cellIndex} className="p-3">
                                {typeof cell === 'string' ? renderBadge(cell) : cell}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={reportData.headers?.length || 1} className="p-8 text-center text-muted-foreground">
                            {t('no_report_records', 'No records found matching the applied filters.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                <FileText className="h-16 w-16 opacity-40 mb-3" />
                <p className="text-base font-semibold">{t('no_preview_available', 'No Preview Available')}</p>
                <p className="text-xs mt-1">{t('apply_filters_desc', 'Fill the parameters above and select report types to load results.')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Reports.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
