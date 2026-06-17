import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info";
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-[#2E7D32]/10 text-[#2E7D32]",
    warning: "bg-[#FF9800]/10 text-[#FF9800]",
    info: "bg-[#0288d1]/10 text-[#0288d1]",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl mb-2">{value}</p>
          {trend && (
            <p
              className={`text-sm ${
                trend.isPositive ? "text-[#2E7D32]" : "text-destructive"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
