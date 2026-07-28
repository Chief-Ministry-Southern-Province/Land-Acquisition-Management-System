import { CheckCircle, Circle, Clock, User, Calendar } from 'lucide-react';
import type { Project } from '@/services/projectsManagementService';

type WorkflowStage = {
  name: string;
  status: 'completed' | 'active' | 'pending';
  date: string;
  officer: string;
  progress?: number;
};

type Props = {
  project: Project;
  compensations: any[];
};

function WorkflowTimeline({ project, compensations }: Props) {
  const parcels = project.landParcels || [];
  const documents = project.documents || [];
  const parcelIds = parcels.map((p) => String(p.id));

  // Filter compensations belonging to this project's parcels
  const projectCompensations = compensations.filter((c) =>
    parcelIds.includes(String(c.land_parcel_id)),
  );

  // Helper to format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  // Stage 1: Project Created
  const createdDate = formatDate(project.created_at || project.approvalDate);
  const stage1: WorkflowStage = {
    name: 'Project Created',
    status: 'completed',
    date: createdDate,
    officer: 'Development Officer',
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
    name: 'Land Identification',
    status: landIdentStatus,
    date: landIdentDate,
    officer: 'Development Officer',
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
    name: 'Survey',
    status: surveyStatus,
    date:
      surveyDate === '-' && surveyCompleted
        ? formatDate(project.updated_at)
        : surveyDate,
    officer: 'Survey Officer',
  };

  // Stage 4: Valuation
  const hasValuationRec = !!project.section23ValuationRecommendation;
  const hasEstimatedValue = parcels.some((p) => Number(p.estimated_value) > 0);
  const valuationCompleted = hasValuationRec || hasEstimatedValue;
  let valuationStatus: 'completed' | 'active' | 'pending' = 'pending';
  if (valuationCompleted) {
    valuationStatus = 'completed';
  } else if (surveyStatus === 'completed') {
    valuationStatus = 'active';
  }
  const stage4: WorkflowStage = {
    name: 'Valuation',
    status: valuationStatus,
    date: valuationCompleted ? formatDate(project.updated_at) : '-',
    officer: 'Valuation Officer',
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
    name: 'Gazette Notice',
    status: gazetteStatus,
    date:
      gazetteDate === '-' && gazetteCompleted
        ? formatDate(project.updated_at)
        : gazetteDate,
    officer: 'Land Officer',
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
    name: 'Owner Notification',
    status: ownerNotifStatus,
    date: ownerNotifCompleted ? formatDate(project.updated_at) : '-',
    officer: 'Data Entry Operator',
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
    name: 'Compensation Calculation',
    status: compCalcStatus,
    date: compCalcDate,
    officer: 'Finance Officer',
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
    name: 'Approval',
    status: approvalStatus,
    date: approvalCompleted
      ? formatDate(project.approvalDate || project.updated_at)
      : '-',
    officer: 'Assistant Secretary',
  };

  // Stage 9: Payment
  const paymentCompleted =
    projectCompensations.length > 0 &&
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
    name: 'Payment',
    status: paymentStatus,
    date: paymentDate,
    officer: 'Finance Officer',
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
    name: 'Land Handover',
    status: handoverStatus,
    date: allAcquired ? formatDate(project.updated_at) : '-',
    officer: 'Land Officer',
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
    name: 'Project Completion',
    status: projectCompStatus,
    date: isProjectCompleted ? formatDate(project.updated_at) : '-',
    officer: '-',
  };

  const stages = [
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

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const totalStages = stages.length;
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-[#2E7D32]" />;
      case 'active':
        return <Clock className="h-8 w-8 animate-pulse text-[#FF9800]" />;
      default:
        return <Circle className="text-muted-foreground/30 h-8 w-8" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-[#2E7D32]/30 bg-[#2E7D32]/5 text-[#2E7D32]';
      case 'active':
        return 'border-[#FF9800]/40 bg-[#FF9800]/5 text-[#FF9800]';
      default:
        return 'border-border bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary progress bar */}
      <div className="bg-card border-border rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Workflow Tracking</p>
          <p className="font-bold text-lg mt-0.5 text-foreground">{project.title || project.name}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{project.projectId}</p>
        </div>
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-muted-foreground">Overall Workflow Progress</span>
            <span className="text-foreground">{completedCount}/{totalStages} Stages Completed</span>
          </div>
          <div className="h-3 bg-muted border border-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2E7D32]/80 to-[#2E7D32] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Timeline Card */}
      <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
        <div className="relative">
          {/* Vertical Connection Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-6">
            {stages.map((stage, index) => {
              const isCompleted = stage.status === 'completed';
              const isActive = stage.status === 'active';

              return (
                <div key={index} className="relative flex items-start gap-5 group">
                  {/* Icon Node */}
                  <div className="relative z-10 shrink-0 transform transition-transform duration-200 group-hover:scale-105">
                    {getStatusIcon(stage.status)}
                  </div>

                  {/* Stage Card */}
                  <div
                    className={`flex-1 rounded-xl border-2 p-4 shadow-xs transition-all duration-300 ${getStatusColor(stage.status)}`}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <h4 className={`text-base font-bold tracking-tight ${isCompleted ? 'text-foreground font-bold' : isActive ? 'text-[#FF9800]' : 'text-muted-foreground'}`}>
                        {stage.name}
                      </h4>
                      {isCompleted && (
                        <span className="shrink-0 rounded-full border border-[#2E7D32]/30 bg-[#2E7D32]/10 px-2.5 py-0.5 text-xs font-bold text-[#2E7D32]">
                          Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="shrink-0 rounded-full border border-[#FF9800]/30 bg-[#FF9800]/10 px-2.5 py-0.5 text-xs font-bold text-[#FF9800]">
                          In Progress
                        </span>
                      )}
                      {stage.status === 'pending' && (
                        <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <User className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="text-muted-foreground">Officer:</span>
                        <span className="text-foreground font-semibold">{stage.officer}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-foreground font-semibold">{stage.date}</span>
                      </div>
                    </div>

                    {/* Progress Indicator for Active Compensation Stage */}
                    {isActive && stage.progress !== undefined && (
                      <div className="border-t border-border mt-3.5 pt-3.5">
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span className="text-muted-foreground">Stage Progress</span>
                          <span className="text-[#FF9800] font-bold">{stage.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted border border-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF9800] rounded-full animate-pulse"
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Approval Workflow Details Card */}
                    {stage.name === 'Approval' && stage.status !== 'pending' && (
                      <div className="border-t border-border mt-3.5 pt-3.5 space-y-2">
                        <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                          Approval Status Details
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* DO */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Development officer Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.doStatus === 'submitted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {project.doStatus === 'submitted' ? 'Submitted' : 'Draft'}
                            </span>
                          </div>
                          {/* HOB */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Head of Branch Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.hobStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : project.hobStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {project.hobStatus || 'Pending'}
                            </span>
                          </div>
                          {/* AO */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Administrative Officer Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.aoStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : project.aoStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {project.aoStatus || 'Pending'}
                            </span>
                          </div>
                          {/* AS */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Assistant Secretary Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.asStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : project.asStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {project.asStatus || 'Pending'}
                            </span>
                          </div>
                          {/* SAS */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Senior Assistant Secretary Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.sasStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : project.sasStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {project.sasStatus || 'Pending'}
                            </span>
                          </div>
                          {/* SEC */}
                          <div className="bg-muted/30 border border-border flex flex-col gap-1 rounded-lg p-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
                              Secretary Status
                            </span>
                            <span
                              className={`inline-flex items-center self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                project.secStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : project.secStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {project.secStatus || 'Pending'}
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
  );
}

export default WorkflowTimeline;