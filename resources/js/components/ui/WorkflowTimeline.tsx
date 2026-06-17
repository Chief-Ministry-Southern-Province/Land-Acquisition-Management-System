import { CheckCircle, Circle, Clock } from "lucide-react";

type Stage = {
  name: string;
  status: "completed" | "active" | "pending";
  date: string;
  officer: string;
  progress?: number;
};

type Props = {
  projectId: string;
  projectName: string;
};

const STAGES: Stage[] = [
  { name: "Project Created", status: "completed", date: "2024-01-15", officer: "Admin User" },
  { name: "Land Identification", status: "completed", date: "2024-02-01", officer: "Land Officer" },
  { name: "Survey", status: "completed", date: "2024-03-10", officer: "Survey Officer" },
  { name: "Valuation", status: "completed", date: "2024-04-20", officer: "Valuation Officer" },
  { name: "Gazette Notice", status: "completed", date: "2024-05-01", officer: "Land Officer" },
  { name: "Owner Notification", status: "completed", date: "2024-05-05", officer: "Data Entry Operator" },
  { name: "Compensation Calculation", status: "active", date: "2024-05-15", officer: "Finance Officer", progress: 65 },
  { name: "Approval", status: "pending", date: "-", officer: "Assistant Secretary" },
  { name: "Payment", status: "pending", date: "-", officer: "Finance Officer" },
  { name: "Land Handover", status: "pending", date: "-", officer: "Land Officer" },
  { name: "Project Completion", status: "pending", date: "-", officer: "-" },
];

const completed = STAGES.filter((s) => s.status === "completed").length;
const total = STAGES.length;


function WorkflowTimeline({ projectId, projectName }: Props) {
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Project</p>
          <p className="font-medium text-sm mt-0.5">{projectName}</p>
          <p className="text-xs text-muted-foreground">{projectId}</p>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{completed}/{total} stages</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.round((completed / total) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9800] inline-block" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" />
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-5">
            {STAGES.map((stage, index) => (
              <div key={index} className="relative flex items-start gap-5">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {stage.status === "completed" && (
                    <CheckCircle className="w-8 h-8 text-[#2E7D32]" />
                  )}
                  {stage.status === "active" && (
                    <Clock className="w-8 h-8 text-[#FF9800]" />
                  )}
                  {stage.status === "pending" && (
                    <Circle className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-lg border-2 p-4 transition-colors ${
                    stage.status === "completed"
                      ? "border-[#2E7D32] bg-[#2E7D32]/5"
                      : stage.status === "active"
                      ? "border-[#FF9800] bg-[#FF9800]/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h4 className="text-base leading-snug">{stage.name}</h4>
                    {stage.status === "completed" && (
                      <span className="flex-shrink-0 px-2.5 py-0.5 bg-[#2E7D32] text-white rounded-full text-xs">
                        Completed
                      </span>
                    )}
                    {stage.status === "active" && (
                      <span className="flex-shrink-0 px-2.5 py-0.5 bg-[#FF9800] text-white rounded-full text-xs">
                        In Progress
                      </span>
                    )}
                    {stage.status === "pending" && (
                      <span className="flex-shrink-0 px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
                    <div>
                      <span className="text-muted-foreground">Officer:</span>
                      <span className="ml-1.5">{stage.officer}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-1.5">{stage.date}</span>
                    </div>
                  </div>

                  {stage.status === "active" && stage.progress !== undefined && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{stage.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF9800] rounded-full"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowTimeline