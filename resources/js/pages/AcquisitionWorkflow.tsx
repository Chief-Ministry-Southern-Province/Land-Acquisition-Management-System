import {
  CheckCircle,
  Circle,
  Clock,
  FolderOpen,
  Building,
  MapPin,
  Layers,
  FileText,
  DollarSign,
  User,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import api from '@/services/api';
import { getProjects, getProject } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

interface WorkflowStage {
  name: string;
  status: 'completed' | 'active' | 'pending';
  date: string;
  officer: string;
  progress?: number;
}

export default function AcquisitionWorkflow() {
  const { t } = useTranslation();
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedProjId, setSelectedProjId] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [compensations, setCompensations] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Fetch list of all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingList(true);
        const data = await getProjects();
        setProjectsList(data);
      } catch (error) {
        console.error('Failed to fetch projects list:', error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch project details when project selection changes
  useEffect(() => {
    if (!selectedProjId) {
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        setLoadingDetails(true);
        const projData = await getProject(selectedProjId);

        // Fetch compensations to compute payment status
        const compResponse = await api.get('/api/compensation');
        const comps = compResponse.data.compensations || [];

        setCurrentProject(projData);
        setCompensations(comps);
      } catch (error) {
        console.error('Failed to fetch project details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchProjectDetails();
  }, [selectedProjId]);

  // Calculate dynamic stages based on project attributes
  const calculateWorkflow = (
    project: Project,
    comps: any[],
  ): WorkflowStage[] => {
    const parcels = project.landParcels || [];
    const documents = project.documents || [];
    const parcelIds = parcels.map((p) => String(p.id));

    // Filter compensations belonging to this project's parcels
    const projectCompensations = comps.filter((c) =>
      parcelIds.includes(String(c.land_parcel_id)),
    );

    // Helper to format date
    const formatDate = (dateStr?: string | null) => {
      if (!dateStr) {
        return '-';
      }

      try {
        const d = new Date(dateStr);

        if (isNaN(d.getTime())) {
          return dateStr;
        }

        return d.toISOString().split('T')[0];
      } catch {
        return dateStr;
      }
    };

    // Stage 1: Project Created
    const createdDate = formatDate(project.created_at || project.approvalDate);
    const stage1: WorkflowStage = {
      name: t('stage_project_created', 'Project Created'),
      status: 'completed',
      date: createdDate,
      officer: t('officer_development', 'Development Officer'),
    };

    // Stage 2: Land Identification
    const hasParcels = parcels.length > 0;
    const landIdentStatus = hasParcels
      ? 'completed'
      : project.caseStatus === 'draft'
        ? 'active'
        : 'pending';
    const landIdentDate =
      hasParcels && parcels[0]?.created_at
        ? formatDate(parcels[0].created_at)
        : hasParcels
          ? createdDate
          : '-';
    const stage2: WorkflowStage = {
      name: t('stage_land_identification', 'Land Identification'),
      status: landIdentStatus,
      date: landIdentDate,
      officer: t('officer_development', 'Development Officer'),
    };

    // Stage 3: Survey
    const hasSurveyPlan = parcels.some((p) => p.has_plan || p.plan_number);
    const hasSurveyDoc = documents.some(
      (d) =>
        d.document_category?.toLowerCase().includes('survey') ||
        d.original_filename?.toLowerCase().includes('survey'),
    );
    const surveyCompleted = hasSurveyPlan || hasSurveyDoc;
    let surveyStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (surveyCompleted) {
      surveyStatus = 'completed';
    } else if (landIdentStatus === 'completed') {
      surveyStatus = 'active';
    }

    const surveyDoc = documents.find(
      (d) =>
        d.document_category?.toLowerCase().includes('survey') ||
        d.original_filename?.toLowerCase().includes('survey'),
    );
    const surveyDate = surveyCompleted
      ? formatDate(surveyDoc?.upload_date || surveyDoc?.created_at) ||
        formatDate(project.updated_at)
      : '-';
    const stage3: WorkflowStage = {
      name: t('stage_survey', 'Survey'),
      status: surveyStatus,
      date:
        surveyDate === '-' && surveyCompleted
          ? formatDate(project.updated_at)
          : surveyDate,
      officer: t('officer_survey', 'Survey Officer'),
    };

    // Stage 4: Valuation
    const hasValuationRec = !!project.section23ValuationRecommendation;
    const hasEstimatedValue = parcels.some(
      (p) => Number(p.estimated_value) > 0,
    );
    const valuationCompleted = hasValuationRec || hasEstimatedValue;
    let valuationStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (valuationCompleted) {
      valuationStatus = 'completed';
    } else if (surveyStatus === 'completed') {
      valuationStatus = 'active';
    }

    const stage4: WorkflowStage = {
      name: t('stage_valuation', 'Valuation'),
      status: valuationStatus,
      date: valuationCompleted ? formatDate(project.updated_at) : '-',
      officer: t('officer_valuation', 'Valuation Officer'),
    };

    // Stage 5: Gazette Notice
    const section20Completed = !!project.section20Observation;
    const hasGazetteDoc = documents.some(
      (d) =>
        d.document_category?.toLowerCase().includes('gazette') ||
        d.original_filename?.toLowerCase().includes('gazette'),
    );
    const gazetteCompleted = section20Completed || hasGazetteDoc;
    let gazetteStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (gazetteCompleted) {
      gazetteStatus = 'completed';
    } else if (valuationStatus === 'completed') {
      gazetteStatus = 'active';
    }

    const gazetteDoc = documents.find(
      (d) =>
        d.document_category?.toLowerCase().includes('gazette') ||
        d.original_filename?.toLowerCase().includes('gazette'),
    );
    const gazetteDate = gazetteCompleted
      ? formatDate(gazetteDoc?.upload_date || gazetteDoc?.created_at) ||
        formatDate(project.updated_at)
      : '-';
    const stage5: WorkflowStage = {
      name: t('stage_gazette_notice', 'Gazette Notice'),
      status: gazetteStatus,
      date:
        gazetteDate === '-' && gazetteCompleted
          ? formatDate(project.updated_at)
          : gazetteDate,
      officer: t('officer_land', 'Land Officer'),
    };

    // Stage 6: Owner Notification
    const hasOwners = parcels.some((p) => p.owners && p.owners.length > 0);
    const ownerNotifCompleted = hasOwners;
    let ownerNotifStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (ownerNotifCompleted) {
      ownerNotifStatus = 'completed';
    } else if (gazetteStatus === 'completed') {
      ownerNotifStatus = 'active';
    }

    const stage6: WorkflowStage = {
      name: t('stage_owner_notification', 'Owner Notification'),
      status: ownerNotifStatus,
      date: ownerNotifCompleted ? formatDate(project.updated_at) : '-',
      officer: t('officer_data_entry', 'Data Entry Operator'),
    };

    // Stage 7: Compensation Calculation
    const compensationCalculated = projectCompensations.length > 0;
    let compCalcStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (compensationCalculated) {
      compCalcStatus = 'completed';
    } else if (ownerNotifStatus === 'completed') {
      compCalcStatus = 'active';
    }

    const compCalcDate = compensationCalculated
      ? formatDate(
          projectCompensations[0].approved_date ||
            projectCompensations[0].created_at,
        )
      : '-';
    const stage7: WorkflowStage = {
      name: t('stage_compensation_calculation', 'Compensation Calculation'),
      status: compCalcStatus,
      date: compCalcDate,
      officer: t('officer_finance', 'Finance Officer'),
      progress: compCalcStatus === 'active' ? 65 : undefined,
    };

    // Stage 8: Approval
    const approvalCompleted =
      project.caseStatus === 'completed' || project.secStatus === 'approved';
    let approvalStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (approvalCompleted) {
      approvalStatus = 'completed';
    } else if (
      compCalcStatus === 'completed' ||
      project.caseStatus === 'pending'
    ) {
      approvalStatus = 'active';
    }

    const stage8: WorkflowStage = {
      name: t('stage_approval', 'Approval'),
      status: approvalStatus,
      date: approvalCompleted
        ? formatDate(project.approvalDate || project.updated_at)
        : '-',
      officer: t('officer_assistant_secretary', 'Assistant Secretary'),
    };

    // Stage 9: Payment
    const hasCompensations = projectCompensations.length > 0;
    const paymentCompleted =
      hasCompensations &&
      projectCompensations.every((c) => c.status === 'paid');
    let paymentStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (paymentCompleted) {
      paymentStatus = 'completed';
    } else if (approvalStatus === 'completed') {
      paymentStatus = 'active';
    }

    const paymentDate = paymentCompleted
      ? formatDate(
          projectCompensations[0].payment_date ||
            projectCompensations[0].updated_at,
        )
      : '-';
    const stage9: WorkflowStage = {
      name: t('stage_payment', 'Payment'),
      status: paymentStatus,
      date: paymentDate,
      officer: t('officer_finance', 'Finance Officer'),
    };

    // Stage 10: Land Handover
    const allAcquired =
      parcels.length > 0 && parcels.every((p) => p.status === 'acquired');
    let handoverStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (allAcquired) {
      handoverStatus = 'completed';
    } else if (paymentStatus === 'completed') {
      handoverStatus = 'active';
    }

    const stage10: WorkflowStage = {
      name: t('stage_land_handover', 'Land Handover'),
      status: handoverStatus,
      date: allAcquired ? formatDate(project.updated_at) : '-',
      officer: t('officer_land', 'Land Officer'),
    };

    // Stage 11: Project Completion
    const isProjectCompleted = project.caseStatus === 'completed';
    let projectCompStatus: 'completed' | 'active' | 'pending' = 'pending';

    if (isProjectCompleted) {
      projectCompStatus = 'completed';
    } else if (handoverStatus === 'completed') {
      projectCompStatus = 'active';
    }

    const stage11: WorkflowStage = {
      name: t('stage_project_completion', 'Project Completion'),
      status: projectCompStatus,
      date: isProjectCompleted ? formatDate(project.updated_at) : '-',
      officer: '-',
    };

    return [
      stage1,
      stage2,
      stage3,
      stage4,
      stage5,
      stage6,
      stage7,
      stage8,
      stage9,
      stage10,
      stage11,
    ];
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-8 w-8 text-[#2E7D32]" />;
    }

    if (status === 'active') {
      return <Clock className="h-8 w-8 text-[#FF9800]" />;
    }

    return <Circle className="text-muted-foreground/30 h-8 w-8" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') {
      return 'border-[#2E7D32] bg-[#2E7D32]/5';
    }

    if (status === 'active') {
      return 'border-[#FF9800] bg-[#FF9800]/5';
    }

    return 'border-border bg-muted/10';
  };

  // Generate tracking info if a project is loaded
  const stages = currentProject
    ? calculateWorkflow(currentProject, compensations)
    : [];
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPercent =
    stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
      {/* Title Header */}
      <div className="border-border flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('acquisition_workflow_title', 'Acquisition Workflow')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            {t(
              'acquisition_workflow_subtitle',
              'Select a project and track its progress across the standard 11 acquisition workflow stages.',
            )}
          </p>
        </div>
      </div>

      {/* Project Selector Block */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="w-full max-w-md flex-1">
            <label
              htmlFor="project-select"
              className="text-muted-foreground mb-2 block text-xs font-semibold uppercase tracking-wider"
            >
              {t('select_acquisition_project', 'Select Acquisition Project')}
            </label>
            {loadingList ? (
              <div className="flex h-10 items-center pl-2">
                <SyncLoader size={6} color="#2E7D32" />
              </div>
            ) : (
              <select
                id="project-select"
                title={t(
                  'select_acquisition_project',
                  'Select Acquisition Project',
                )}
                className="bg-input-background border-border w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                value={selectedProjId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProjId(val);

                  if (!val) {
                    setCurrentProject(null);
                    setCompensations([]);
                  }
                }}
              >
                <option value="">
                  {t('choose_a_project', '-- Choose a Project --')}
                </option>
                {projectsList.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title || proj.name} ({proj.projectId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentProject && (
            <div className="bg-muted/40 border-border flex items-center gap-3 rounded-xl border px-4 py-2.5">
              <TrendingUp className="h-5 w-5 text-[#2E7D32]" />
              <div>
                <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                  {t('workflow_progress', 'Workflow Progress')}
                </div>
                <div className="text-foreground text-sm font-bold">
                  {t(
                    'stages_completed',
                    ':completed of :total Stages Completed',
                  )
                    .replace(':completed', String(completedCount))
                    .replace(':total', String(stages.length))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      {loadingDetails ? (
        <div className="bg-card border-border flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border">
          <SyncLoader size={12} color="#2E7D32" />
          <p className="text-muted-foreground text-sm">
            {t('loading_acquisition_data', 'Loading acquisition data...')}
          </p>
        </div>
      ) : currentProject ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Project Insights */}
          <div className="space-y-6 lg:col-span-5">
            {/* Overview Card */}
            <div className="bg-card border-border space-y-5 rounded-xl border p-6 shadow-sm">
              <div className="border-border flex items-center gap-3 border-b pb-4">
                <div className="rounded-lg bg-[#2E7D32]/10 p-2">
                  <Building className="h-6 w-6 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-snug">
                    {currentProject.title || currentProject.name}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {currentProject.projectId}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase tracking-wider">
                    {t('purpose', 'Purpose')}
                  </span>
                  <p className="text-sm leading-relaxed">
                    {currentProject.purpose ||
                      t('no_purpose_declared', 'No purpose declared')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase tracking-wider">
                      {t('institution', 'Institution')}
                    </span>
                    <p className="text-sm font-medium">
                      {currentProject.institution || t('n_a', 'N/A')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase tracking-wider">
                      {t('case_status_label', 'Case Status')}
                    </span>
                    <div className="mt-0.5">
                      <StatusBadge
                        status={currentProject.caseStatus || 'draft'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase tracking-wider">
                    {t('total_land_area_required', 'Total Land Area Required')}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="bg-muted border-border rounded-md border px-2 py-1 text-xs font-semibold">
                      {currentProject.landAreaAcers ?? 0} {t('acres', 'Acres')}
                    </span>
                    <span className="bg-muted border-border rounded-md border px-2 py-1 text-xs font-semibold">
                      {currentProject.landAreaRoods ?? 0} {t('roods', 'Roods')}
                    </span>
                    <span className="bg-muted border-border rounded-md border px-2 py-1 text-xs font-semibold">
                      {currentProject.landAreaPerches ?? 0}{' '}
                      {t('perches', 'Perches')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Land Parcels Card */}
            <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
              <div className="border-border flex items-center gap-2 border-b pb-3">
                <Layers className="h-5 w-5 text-[#2E7D32]" />
                <h4 className="text-base font-bold">
                  {t(
                    'land_parcels_with_count',
                    'Land Parcels (:count)',
                  ).replace(
                    ':count',
                    String(currentProject.landParcels?.length || 0),
                  )}
                </h4>
              </div>

              {currentProject.landParcels &&
              currentProject.landParcels.length > 0 ? (
                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {currentProject.landParcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      className="bg-muted/40 border-border hover:bg-muted/70 flex flex-col gap-2 rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                          <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                          {parcel.land_name || parcel.parcel_id}
                        </span>
                        <StatusBadge status={parcel.status} />
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>
                          {parcel.village}, {parcel.district}
                        </span>
                        <span className="text-foreground flex items-center gap-0.5 font-medium">
                          <DollarSign className="h-3 w-3" />
                          {Number(
                            parcel.estimated_value || 0,
                          ).toLocaleString()}{' '}
                          {t('lkr_currency', 'LKR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/10 border-border rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t(
                      'no_land_parcels_for_project',
                      'No land parcels associated with this project.',
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Documents Card */}
            <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
              <div className="border-border flex items-center gap-2 border-b pb-3">
                <FileText className="h-5 w-5 text-[#2E7D32]" />
                <h4 className="text-base font-bold">
                  {t('documents_with_count', 'Documents (:count)').replace(
                    ':count',
                    String(currentProject.documents?.length || 0),
                  )}
                </h4>
              </div>

              {currentProject.documents &&
              currentProject.documents.length > 0 ? (
                <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
                  {currentProject.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-muted/40 border-border hover:bg-muted/70 flex items-center justify-between rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-red-500" />
                        <div className="min-w-0">
                          <p
                            className="text-foreground truncate text-xs font-medium"
                            title={doc.original_filename}
                          >
                            {doc.original_filename}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[10px]">
                            {doc.document_category} • {doc.file_size}
                          </p>
                        </div>
                      </div>
                      <span className="text-muted-foreground shrink-0 pl-2 text-[10px] font-semibold">
                        {doc.upload_date}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/10 border-border rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t(
                      'no_documents_for_project_workflow',
                      'No uploaded documents found for this project.',
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Workflow Timeline */}
          <div className="space-y-5 lg:col-span-7">
            {/* Timeline Progress Bar Card */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-5 shadow-sm">
              <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                <span>
                  {t('overall_status_tracker', 'Overall Status Tracker')}
                </span>
                <span className="font-bold text-[#2E7D32]">
                  {progressPercent}%
                </span>
              </div>
              <div className="bg-muted border-border h-3 overflow-hidden rounded-full border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2E7D32]/80 to-[#2E7D32] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps Timeline Details */}
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <div className="relative">
                {/* Vertical Timeline Connection Line */}
                <div className="bg-border absolute bottom-6 left-4 top-4 w-0.5"></div>

                {/* Workflow Steps */}
                <div className="space-y-6">
                  {stages.map((stage, index) => {
                    const isCompleted = stage.status === 'completed';
                    const isActive = stage.status === 'active';

                    return (
                      <div
                        key={index}
                        className="group relative flex items-start gap-5"
                      >
                        {/* Icon Node */}
                        <div className="relative z-10 shrink-0 transform transition-transform duration-200 group-hover:scale-105">
                          {getStatusIcon(stage.status)}
                        </div>

                        {/* Step Card Content */}
                        <div
                          className={`flex-1 rounded-xl border-2 p-4 shadow-sm transition-all duration-300 ${getStatusColor(stage.status)}`}
                        >
                          <div className="mb-2.5 flex items-center justify-between gap-3">
                            <h4
                              className={`text-base font-bold tracking-tight ${isCompleted ? 'text-foreground' : isActive ? 'text-[#FF9800]' : 'text-muted-foreground'}`}
                            >
                              {stage.name}
                            </h4>
                            {isActive && (
                              <span className="shrink-0 rounded-full border border-[#FF9800]/30 bg-[#FF9800]/10 px-2.5 py-0.5 text-xs font-bold text-[#FF9800]">
                                {t('in_progress', 'In Progress')}
                              </span>
                            )}
                            {isCompleted && (
                              <span className="shrink-0 rounded-full border border-[#2E7D32]/30 bg-[#2E7D32]/10 px-2.5 py-0.5 text-xs font-bold text-[#2E7D32]">
                                {t('completed', 'Completed')}
                              </span>
                            )}
                            {stage.status === 'pending' && (
                              <span className="bg-muted border-border text-muted-foreground shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                                {t('pending', 'Pending')}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div className="flex items-center gap-1.5">
                              <User className="text-muted-foreground h-3.5 w-3.5" />
                              <span className="text-muted-foreground">
                                {t('workflow_officer_label', 'Officer:')}
                              </span>
                              <span className="text-foreground font-semibold">
                                {stage.officer}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:justify-end">
                              <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                              <span className="text-muted-foreground">
                                {t('workflow_date_label', 'Date:')}
                              </span>
                              <span className="text-foreground font-semibold">
                                {stage.date}
                              </span>
                            </div>
                          </div>

                          {/* Active Step Progress Indicator */}
                          {isActive && stage.progress !== undefined && (
                            <div className="border-border mt-3.5 border-t pt-3.5">
                              <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium">
                                  {t('stage_progress_label', 'Stage Progress:')}
                                </span>
                                <span className="font-bold text-[#FF9800]">
                                  {stage.progress}%
                                </span>
                              </div>
                              <div className="bg-muted border-border h-2 w-full overflow-hidden rounded-full border">
                                <div
                                  className="h-full animate-pulse rounded-full bg-[#FF9800]"
                                  style={{ width: `${stage.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Approval workflow detail steps */}
                          {stage.name === t('stage_approval', 'Approval') &&
                            stage.status !== 'pending' &&
                            currentProject && (
                              <div className="border-border mt-3.5 space-y-2 border-t pt-3.5">
                                <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                  {t(
                                    'approval_status_details',
                                    'Approval Status Details:',
                                  )}
                                </div>
                                <div className="flex flex-col gap-2.5">
                                  {/* DO */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'do_status_label',
                                        'Development Officer Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.doStatus === 'submitted'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                      }`}
                                    >
                                      {currentProject.doStatus === 'submitted'
                                        ? t('status_submitted', 'Submitted')
                                        : t('status_draft', 'Draft')}
                                    </span>
                                  </div>
                                  {/* HOB */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'hob_status_label',
                                        'Head of Branch Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.hobStatus === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : currentProject.hobStatus ===
                                              'rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      }`}
                                    >
                                      {currentProject.hobStatus ||
                                        t('status_pending', 'Pending')}
                                    </span>
                                  </div>
                                  {/* AO */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'ao_status_label',
                                        'Administrative Officer Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.aoStatus === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : currentProject.aoStatus ===
                                              'rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      }`}
                                    >
                                      {currentProject.aoStatus ||
                                        t('status_pending', 'Pending')}
                                    </span>
                                  </div>
                                  {/* AS */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'as_status_label',
                                        'Assistant Secretary Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.asStatus === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : currentProject.asStatus ===
                                              'rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      }`}
                                    >
                                      {currentProject.asStatus ||
                                        t('status_pending', 'Pending')}
                                    </span>
                                  </div>
                                  {/* SAS */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'sas_status_label',
                                        'Senior Assistant Secretary Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.sasStatus === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : currentProject.sasStatus ===
                                              'rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      }`}
                                    >
                                      {currentProject.sasStatus ||
                                        t('status_pending', 'Pending')}
                                    </span>
                                  </div>
                                  {/* SEC */}
                                  <div className="bg-muted/30 border-border flex flex-col gap-1 rounded-lg border p-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                                      {t(
                                        'sec_status_label',
                                        'Secretary Status',
                                      )}
                                    </span>
                                    <span
                                      className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        currentProject.secStatus === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : currentProject.secStatus ===
                                              'rejected'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                      }`}
                                    >
                                      {currentProject.secStatus ||
                                        t('status_pending', 'Pending')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-card border-border flex min-h-[400px] flex-col items-center justify-center rounded-xl border p-8 text-center shadow-sm">
          <div className="bg-muted/60 border-border mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner">
            <FolderOpen className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground text-xl font-bold">
            {t('track_acquisition_progress', 'Track Acquisition Progress')}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed md:text-base">
            {t(
              'workflow_empty_description',
              'Please choose a project from the dropdown menu above. LAMS will automatically calculate and visualizes its complete land acquisition progress across the 11 stages of the workflow.',
            )}
          </p>

          {/* Quick Info Points */}
          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 md:grid-cols-4">
            <div className="bg-muted/30 border-border flex items-start gap-3 rounded-xl border p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D32]" />
              <div>
                <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                  {t('info_tracked_stages_title', '11 Tracked Stages')}
                </h5>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {t(
                    'info_tracked_stages_desc',
                    'Covers creation, survey, valuation, and final handover.',
                  )}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-border flex items-start gap-3 rounded-xl border p-4">
              <Layers className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D32]" />
              <div>
                <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                  {t('info_parcels_inventory_title', 'Parcels Inventory')}
                </h5>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {t(
                    'info_parcels_inventory_desc',
                    'Monitor associated land plots and estimated valuations.',
                  )}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-border flex items-start gap-3 rounded-xl border p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D32]" />
              <div>
                <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                  {t(
                    'info_documents_integration_title',
                    'Documents Integration',
                  )}
                </h5>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {t(
                    'info_documents_integration_desc',
                    'Cross-references surveys, gazette notices, and letters.',
                  )}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-border flex items-start gap-3 rounded-xl border p-4">
              <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D32]" />
              <div>
                <h5 className="text-foreground text-xs font-bold uppercase tracking-wide">
                  {t('info_compensations_title', 'Compensations')}
                </h5>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {t(
                    'info_compensations_desc',
                    'Validates financial calculations and actual payment statuses.',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AcquisitionWorkflow.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
