import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Search,
  Download,
  Calendar,
  User,
  Paperclip,
  Check,
  Image as ImageIcon,
  MessageSquareQuote,
  Eye,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  DEFAULT_STAGES_EN,
  DEFAULT_STAGES_SI,
  normalizeAndSyncStages,
  formatBytes,
  isImageFile,
} from '@/constants/projectProgressStages';
import type {
  ChecklistStage,
  AttachedFile,
} from '@/constants/projectProgressStages';
import { useTranslation } from '@/hooks/useTranslation';
import { downloadDocument } from '@/services/documentManagementService';
import { getProjectProgress } from '@/services/projectProgressService';
import type { Project } from '@/services/projectsManagementService';

interface WorkflowProgressChecklistProps {
  projectId: string;
  project?: Project | null;
}

export default function WorkflowProgressChecklist({
  projectId,
  project,
}: WorkflowProgressChecklistProps) {
  const { t, locale } = useTranslation();

  const defaultStagesForLocale = useMemo(
    () => (locale === 'si' ? DEFAULT_STAGES_SI : DEFAULT_STAGES_EN),
    [locale],
  );

  const [stages, setStages] = useState<ChecklistStage[]>(defaultStagesForLocale);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<
    'all' | 'completed' | 'pending' | 'mandatory'
  >('all');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [updatedByOfficer, setUpdatedByOfficer] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [expandedAllStages, setExpandedAllStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  // Fetch progress data from backend whenever projectId changes
  useEffect(() => {
    let isMounted = true;

    if (!projectId) {
      return;
    }

    const loadProgress = async () => {
      try {
        setLoading(true);
        const projectDocs = project?.documents || [];

        const res = await getProjectProgress(projectId);

        if (!isMounted) {
return;
}

        if (
          res.progress?.stages &&
          Array.isArray(res.progress.stages) &&
          res.progress.stages.length > 0
        ) {
          const syncedStages = normalizeAndSyncStages(
            res.progress.stages,
            defaultStagesForLocale,
            projectDocs,
          );
          setStages(syncedStages);

          if (res.progress.last_saved_at) {
            setLastSavedTime(
              new Date(res.progress.last_saved_at).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            );
          } else {
            setLastSavedTime(null);
          }

          if (res.progress.updated_by_user?.name) {
            setUpdatedByOfficer(res.progress.updated_by_user.name);
          } else {
            setUpdatedByOfficer(null);
          }
        } else {
          // Initialize clean default stages synced with project documents
          const syncedStages = normalizeAndSyncStages(
            [],
            defaultStagesForLocale,
            projectDocs,
          );
          setStages(syncedStages);
          setLastSavedTime(null);
          setUpdatedByOfficer(null);
        }
      } catch (err) {
        console.warn('Failed to fetch project progress records:', err);
        const projectDocs = project?.documents || [];
        setStages(
          normalizeAndSyncStages([], defaultStagesForLocale, projectDocs),
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [projectId, project, defaultStagesForLocale]);

  // Overall statistics calculation
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let mandatoryTotal = 0;
    let mandatoryCompleted = 0;
    let totalFiles = 0;

    stages.forEach((stage) => {
      totalFiles += (stage.attachedFiles || []).length;
      stage.items.forEach((item) => {
        totalItems += 1;

        if (item.isCompleted) {
completedItems += 1;
}

        if (item.isMandatory) {
          mandatoryTotal += 1;

          if (item.isCompleted) {
mandatoryCompleted += 1;
}
        }
      });
    });

    const overallPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const mandatoryPercentage =
      mandatoryTotal > 0 ? Math.round((mandatoryCompleted / mandatoryTotal) * 100) : 0;

    return {
      totalItems,
      completedItems,
      pendingItems: totalItems - completedItems,
      overallPercentage,
      mandatoryTotal,
      mandatoryCompleted,
      mandatoryPercentage,
      totalFiles,
    };
  }, [stages]);

  // Current active stage
  const currentStage = useMemo(() => {
    return stages.find((s) => s.id === activeStageId) || stages[0] || null;
  }, [stages, activeStageId]);

  const filteredCurrentItems = useMemo(() => {
    if (!currentStage) {
      return [];
    }

    return currentStage.items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        (item.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.description || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.sectionRef || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!matchSearch) {
        return false;
      }

      if (filterType === 'completed') {
        return item.isCompleted;
      }

      if (filterType === 'pending') {
        return !item.isCompleted;
      }

      if (filterType === 'mandatory') {
        return item.isMandatory;
      }

      return true;
    });
  }, [currentStage, searchQuery, filterType]);

  // Download handler
  const handleDownload = async (fileObj: AttachedFile) => {
    if (!fileObj.docId) {
return;
}

    try {
      setDownloadingDocId(fileObj.id);
      await downloadDocument(fileObj.docId, fileObj.name);
    } catch (err) {
      console.error('Failed to download document:', err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const toggleStageExpansion = (stageId: number) => {
    setExpandedAllStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  if (loading) {
    return (
      <div className="bg-card border-border flex min-h-[300px] flex-col items-center justify-center rounded-2xl border p-8 shadow-xs">
        <LoadingSpinner
          size="lg"
          label={t(
            'loading_progress_checklist',
            'Loading statutory progress checklist...',
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-card border-border/80 relative overflow-hidden rounded-2xl border p-6 shadow-sm">
        {/* Subtle decorative background gradient */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                  {t('progress_checklist', 'Progress Checklist')}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('do_verified_record', 'Official DO Record')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {t('view_only_audit_mode', 'View Only (Auditing & Review)')}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {t(
                  'checklist_view_description',
                  'Auditing statutory milestone compliance recorded by the assigned Development Officer under the Land Acquisition Act (LAA).',
                )}
              </p>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="bg-muted/40 border-border/80 flex shrink-0 items-center gap-3 rounded-xl border p-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase tracking-wider">
                {t('verification_status', 'DO Verification Status')}
              </span>
              {lastSavedTime ? (
                <span className="text-foreground font-medium">
                  {updatedByOfficer ? `${updatedByOfficer} • ` : ''}
                  {lastSavedTime}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {t('awaiting_do_submission', 'Awaiting initial DO submission')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Executive Overview KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Overall Progress */}
          <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                {t('overall_completion', 'Overall Completion')}
              </span>
              <span className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-foreground text-2xl font-bold tracking-tight">
                  {stats.overallPercentage}%
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  {stats.completedItems} / {stats.totalItems} {t('tasks_done', 'tasks')}
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
                  style={{ width: `${stats.overallPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Mandatory Statutory Clauses */}
          <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                {t('mandatory_clauses', 'Statutory Mandatory')}
              </span>
              <span className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-foreground text-2xl font-bold tracking-tight">
                  {stats.mandatoryCompleted} / {stats.mandatoryTotal}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {stats.mandatoryPercentage}%
                </span>
              </div>
              <span className="text-muted-foreground mt-1 block text-[11px]">
                {t('mandatory_clauses_fulfilled', 'Mandatory Act requirements fulfilled')}
              </span>
            </div>
          </div>

          {/* Card 3: Pending Milestones */}
          <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                {t('pending_milestones', 'Pending Milestones')}
              </span>
              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {stats.pendingItems}
              </span>
              <span className="text-muted-foreground mt-1 block text-[11px]">
                {t('pending_do_action_desc', 'Awaiting field actions or orders')}
              </span>
            </div>
          </div>

          {/* Card 4: Evidence & Documents */}
          <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                {t('evidence_documents', 'Evidence & Documents')}
              </span>
              <span className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600 dark:text-purple-400">
                <Paperclip className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {stats.totalFiles}
              </span>
              <span className="text-muted-foreground mt-1 block text-[11px]">
                {t('attached_gazettes_plans', 'Attached gazettes, plans & reports')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Pipeline Selector & View Options */}
      <div className="bg-card border-border/80 rounded-2xl border p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-primary h-4 w-4" />
            <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
              {t('acquisition_pipeline_stages', '6 Statutory Acquisition Stages')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('single')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'single'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('stage_focus_view', 'Stage Focus View')}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('all_stages_audit', 'All Stages (Audit View)')}
            </button>
          </div>
        </div>

        {/* 6 Stages Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage) => {
            const completedCount = stage.items.filter((i) => i.isCompleted).length;
            const totalCount = stage.items.length;
            const isCompleted = totalCount > 0 && completedCount === totalCount;
            const isInProgress = completedCount > 0 && !isCompleted;
            const isSelected = stage.id === activeStageId && viewMode === 'single';

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStageId(stage.id);

                  if (viewMode === 'all') {
                    setViewMode('single');
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-border/70 bg-card hover:border-emerald-500/40 hover:bg-muted/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-105 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : stage.id}
                    </span>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : isInProgress
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted
                        ? t('done', 'Done')
                        : isInProgress
                          ? t('in_progress', 'Active')
                          : t('pending', 'Pending')}
                    </span>
                  </div>

                  <h4 className="text-foreground line-clamp-2 text-xs font-bold leading-tight">
                    {stage.name}
                  </h4>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span className="font-mono text-[10px]">
                      {(stage.actSection || `Stage ${stage.id}`).split(' ')[0]}
                    </span>
                    <span className="font-semibold text-foreground">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-600'
                          : isInProgress
                            ? 'bg-amber-500'
                            : 'bg-muted-foreground/30'
                      }`}
                      style={{
                        width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Stage View or All Stages Audit View */}
      {viewMode === 'single' && currentStage ? (
        <div className="bg-card border-border/80 space-y-6 rounded-2xl border p-6 shadow-sm">
          {/* Active Stage Header */}
          <div className="space-y-4 border-b border-border/60 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Stage {currentStage.id}:{' '}
                  {currentStage.actSection || `Stage ${currentStage.id}`}
                </span>
                <h3 className="text-foreground mt-2 text-lg font-bold sm:text-xl">
                  {currentStage.name}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {currentStage.description}
                </p>
              </div>

              {/* Stage Completion Counter */}
              <div className="bg-muted/40 border-border/80 flex items-center gap-3 rounded-xl border px-4 py-2.5">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase tracking-wider">
                    {t('stage_progress', 'Stage Progress')}
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    {currentStage.items.filter((i) => i.isCompleted).length} /{' '}
                    {currentStage.items.length} {t('completed', 'Completed')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                    {currentStage.items.length > 0
                      ? Math.round(
                          (currentStage.items.filter((i) => i.isCompleted).length /
                            currentStage.items.length) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Controls Bar: Search & Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t(
                    'search_checklist_placeholder',
                    'Search milestone requirements or Act section...',
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border bg-input-background text-foreground focus:ring-emerald-500/40 focus:border-emerald-500 w-full rounded-lg border py-2 pl-9 pr-3 text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2"
                />
              </div>

              <div className="bg-muted/60 flex items-center gap-1 rounded-lg p-1">
                {(['all', 'completed', 'pending', 'mandatory'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      filterType === type
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(`filter_${type}`, type)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Milestone Cards */}
          <div className="space-y-3.5">
            {filteredCurrentItems.length === 0 ? (
              <div className="bg-muted/20 border-border/80 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <CheckCircle2 className="text-muted-foreground/30 mb-2 h-10 w-10" />
                <p className="text-muted-foreground text-sm font-medium">
                  {t('no_items_match_criteria', 'No milestone items match the filter criteria.')}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="text-primary mt-2 text-xs font-semibold hover:underline"
                >
                  {t('clear_filters', 'Clear filters')}
                </button>
              </div>
            ) : (
              filteredCurrentItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl border p-4 sm:p-5 transition-all ${
                    item.isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/20 shadow-xs'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Visual Status Indicator Icon */}
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        item.isCompleted
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground/60'
                      }`}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-foreground text-sm font-bold sm:text-base">
                            {item.title}
                          </h4>
                          {item.isMandatory ? (
                            <span className="inline-flex items-center gap-1 rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              <ShieldCheck className="h-3 w-3" />
                              {t('mandatory', 'Mandatory Clause')}
                            </span>
                          ) : (
                            <span className="rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t('optional', 'Optional')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="border-border bg-muted font-mono text-[11px] font-medium text-foreground rounded-md border px-2.5 py-1">
                            {item.sectionRef}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              item.isCompleted
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.isCompleted
                              ? t('completed', 'Completed')
                              : t('pending_do', 'Pending DO')}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                        {item.description}
                      </p>

                      {/* Verification Metadata Footnote */}
                      {item.isCompleted && (
                        <div className="bg-emerald-500/5 dark:bg-emerald-950/30 border-emerald-500/20 flex flex-wrap items-center gap-4 rounded-lg border px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <User className="h-3.5 w-3.5" />
                            <span>
                              {t('verified_by', 'Verified by')}:{' '}
                              <strong>{item.completedBy || t('development_officer', 'Development Officer')}</strong>
                            </span>
                          </span>
                          {item.completedAt && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(item.completedAt).toLocaleString()}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* DO Remarks / Field Notes Display */}
                      {item.remarks && item.remarks.trim().length > 0 && (
                        <div className="bg-muted/40 border-border/80 flex items-start gap-2.5 rounded-lg border p-3 text-xs">
                          <MessageSquareQuote className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-foreground block font-semibold">
                              {t('do_field_notes', 'Development Officer Field Notes')}:
                            </span>
                            <p className="text-muted-foreground mt-0.5 italic">
                              "{item.remarks}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stage Attached Documents & Evidence Section */}
          <div className="border-border/70 bg-muted/20 rounded-xl border p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="text-primary h-4 w-4" />
                <h4 className="text-foreground text-xs font-bold uppercase tracking-wider">
                  {t('stage_evidence_documents', 'Stage Evidence Documents & Files')}
                </h4>
                {currentStage.attachedFiles && currentStage.attachedFiles.length > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {currentStage.attachedFiles.length} {t('files', 'files')}
                  </span>
                )}
              </div>

              <span className="text-muted-foreground text-xs">
                {t('available_for_download', 'Available for statutory review & download')}
              </span>
            </div>

            {currentStage.attachedFiles && currentStage.attachedFiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {currentStage.attachedFiles.map((fileObj) => (
                  <div
                    key={fileObj.id}
                    className="bg-card border-border/80 flex items-center justify-between gap-3 rounded-lg border p-3 shadow-2xs transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isImageFile(fileObj.name)
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {isImageFile(fileObj.name) ? (
                          <ImageIcon className="h-4.5 w-4.5" />
                        ) : (
                          <FileText className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span
                          className="text-foreground block truncate text-xs font-semibold"
                          title={fileObj.name}
                        >
                          {fileObj.name}
                        </span>
                        <span className="text-muted-foreground block text-[11px]">
                          {formatBytes(fileObj.size)} •{' '}
                          {fileObj.uploadedAt
                            ? new Date(fileObj.uploadedAt).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(fileObj)}
                      disabled={downloadingDocId === fileObj.id}
                      className="border-border hover:bg-muted text-foreground flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                      title={t('download_document', 'Download Document')}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t('download', 'Download')}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 py-2 text-xs italic">
                {t(
                  'no_stage_documents_uploaded',
                  'No evidence documents or plans attached to this stage yet.',
                )}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* All Stages Expanded View for Complete Audit */
        <div className="space-y-6">
          {stages.map((stage) => {
            const completedCount = stage.items.filter((i) => i.isCompleted).length;
            const totalCount = stage.items.length;
            const isCompleted = totalCount > 0 && completedCount === totalCount;
            const isExpanded = expandedAllStages[stage.id] ?? true;

            return (
              <div
                key={stage.id}
                className="bg-card border-border/80 overflow-hidden rounded-2xl border shadow-sm"
              >
                {/* Stage Header Bar */}
                <div
                  onClick={() => toggleStageExpansion(stage.id)}
                  className="bg-muted/30 border-b border-border/60 flex cursor-pointer items-center justify-between p-4 sm:p-5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : completedCount > 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : stage.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-mono font-semibold">
                          {stage.actSection || `Stage ${stage.id}`}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {completedCount} / {totalCount} {t('done', 'Done')}
                        </span>
                      </div>
                      <h4 className="text-foreground text-base font-bold">
                        {stage.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground hidden text-xs sm:inline-block">
                      {stage.description}
                    </span>
                    <button
                      type="button"
                      className="border-border text-muted-foreground rounded-lg border p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Stage Content */}
                {isExpanded && (
                  <div className="p-5 space-y-4">
                    <div className="space-y-3">
                      {stage.items.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 transition-all ${
                            item.isCompleted
                              ? 'border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/20'
                              : 'border-border/70 bg-card'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                item.isCompleted
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground/60'
                              }`}
                            >
                              {item.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 stroke-[2.2]" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-foreground text-sm font-bold">
                                    {item.title}
                                  </h5>
                                  {item.isMandatory && (
                                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      {t('mandatory', 'Mandatory')}
                                    </span>
                                  )}
                                </div>
                                <span className="border-border bg-muted text-muted-foreground font-mono text-[11px] rounded border px-2 py-0.5">
                                  {item.sectionRef}
                                </span>
                              </div>

                              <p className="text-muted-foreground text-xs leading-relaxed">
                                {item.description}
                              </p>

                              {item.isCompleted && (
                                <div className="text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-3 text-[11px]">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {item.completedBy || t('development_officer', 'Development Officer')}
                                  </span>
                                  {item.completedAt && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.completedAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.remarks && (
                                <div className="bg-muted/40 text-muted-foreground rounded-lg p-2 text-xs italic">
                                  "{item.remarks}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stage Documents if any */}
                    {stage.attachedFiles && stage.attachedFiles.length > 0 && (
                      <div className="bg-muted/20 border-border/60 rounded-xl border p-3.5 space-y-2">
                        <span className="text-foreground text-xs font-bold uppercase tracking-wider block">
                          {t('attached_documents', 'Attached Documents')} ({stage.attachedFiles.length})
                        </span>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {stage.attachedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="bg-card border-border/80 flex items-center justify-between gap-2 rounded-lg border p-2 text-xs"
                            >
                              <span className="truncate font-medium">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleDownload(file)}
                                className="text-primary hover:underline text-xs shrink-0 flex items-center gap-1 font-semibold"
                              >
                                <Download className="h-3 w-3" />
                                {t('download', 'Download')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
