import { CheckCircle, Circle, Clock } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

export default function AcquisitionWorkflow() {
  const stages = [
    {
      name: 'Project Created',
      status: 'completed',
      date: '2024-01-15',
      officer: 'Admin User',
    },
    {
      name: 'Land Identification',
      status: 'completed',
      date: '2024-02-01',
      officer: 'Land Officer',
    },
    {
      name: 'Survey',
      status: 'completed',
      date: '2024-03-10',
      officer: 'Survey Officer',
    },
    {
      name: 'Valuation',
      status: 'completed',
      date: '2024-04-20',
      officer: 'Valuation Officer',
    },
    {
      name: 'Gazette Notice',
      status: 'completed',
      date: '2024-05-01',
      officer: 'Land Officer',
    },
    {
      name: 'Owner Notification',
      status: 'completed',
      date: '2024-05-05',
      officer: 'Data Entry Operator',
    },
    {
      name: 'Compensation Calculation',
      status: 'active',
      date: '2024-05-15',
      officer: 'Finance Officer',
    },
    {
      name: 'Approval',
      status: 'pending',
      date: '-',
      officer: 'Assistant Secretary',
    },
    {
      name: 'Payment',
      status: 'pending',
      date: '-',
      officer: 'Finance Officer',
    },
    {
      name: 'Land Handover',
      status: 'pending',
      date: '-',
      officer: 'Land Officer',
    },
    { name: 'Project Completion', status: 'pending', date: '-', officer: '-' },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-8 w-8 text-[#2E7D32]" />;
    }

    if (status === 'active') {
      return <Clock className="h-8 w-8 text-[#FF9800]" />;
    }

    return <Circle className="text-muted-foreground h-8 w-8" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') {
      return 'border-[#2E7D32] bg-[#2E7D32]/5';
    }

    if (status === 'active') {
      return 'border-[#FF9800] bg-[#FF9800]/5';
    }

    return 'border-border bg-muted/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Acquisition Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Track the progress of land acquisition process
        </p>
      </div>

      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-6">
          Project: Southern Highway Expansion Phase 2 (PRJ-2024-045)
        </h3>

        <div className="relative">
          {/* Vertical Line */}
          <div className="bg-border absolute bottom-4 left-4 top-4 w-0.5"></div>

          {/* Workflow Steps */}
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={index} className="relative flex items-start gap-6">
                <div className="relative z-10 shrink-0">
                  {getStatusIcon(stage.status)}
                </div>

                <div
                  className={`flex-1 rounded-lg border-2 p-4 ${getStatusColor(stage.status)}`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-lg">{stage.name}</h4>
                    {stage.status === 'active' && (
                      <span className="rounded-full bg-[#FF9800] px-3 py-1 text-sm text-white">
                        In Progress
                      </span>
                    )}
                    {stage.status === 'completed' && (
                      <span className="rounded-full bg-[#2E7D32] px-3 py-1 text-sm text-white">
                        Completed
                      </span>
                    )}
                    {stage.status === 'pending' && (
                      <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Responsible Officer:
                      </span>
                      <span className="ml-2">{stage.officer}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2">{stage.date}</span>
                    </div>
                  </div>

                  {stage.status === 'active' && (
                    <div className="border-border mt-4 border-t pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm">Progress:</span>
                        <span className="text-sm">65%</span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#FF9800]"
                          style={{ width: '65%' }}
                        ></div>
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
  );
}

AcquisitionWorkflow.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
