import MainLayout from '@/layouts/MainLayout';

export default function DODashboard() {
  return <div>Development Officer Dashboard</div>;
}

DODashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
