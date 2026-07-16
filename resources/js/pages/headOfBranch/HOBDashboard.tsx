import MainLayout from '@/layouts/MainLayout';

export default function HOBDashboard() {
  return <div>Head of Branch Dashboard</div>;
}

HOBDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
