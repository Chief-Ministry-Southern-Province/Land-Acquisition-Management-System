import { Badge } from "./Badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: any; label: string }> = {
    active: { variant: "success", label: "Active" },
    pending: { variant: "warning", label: "Pending" },
    completed: { variant: "primary", label: "Completed" },
    cancelled: { variant: "danger", label: "Cancelled" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "danger", label: "Rejected" },
    "in-progress": { variant: "info", label: "In Progress" },
    draft: { variant: "default", label: "Draft" },
    scheduled: { variant: "info", label: "Scheduled" },
    paid: { variant: "success", label: "Paid" },
    unpaid: { variant: "warning", label: "Unpaid" },
    overdue: { variant: "danger", label: "Overdue" },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: "default", label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
