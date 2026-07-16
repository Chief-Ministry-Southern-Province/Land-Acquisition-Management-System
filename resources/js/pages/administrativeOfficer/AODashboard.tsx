import MainLayout from '@/layouts/MainLayout';

export default function AODashboard() {
  return <div>Administrative Officer Dashboard</div>;
}

AODashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
