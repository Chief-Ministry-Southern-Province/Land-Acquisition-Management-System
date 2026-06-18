import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

export default function CalculateCompensation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/compensation"
          className="hover:bg-muted rounded-lg p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1>Compensation Calculation</h1>
          <p className="text-muted-foreground">
            Calculate compensation for land acquisition
          </p>
        </div>
      </div>
    </div>
  );
}

CalculateCompensation.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
