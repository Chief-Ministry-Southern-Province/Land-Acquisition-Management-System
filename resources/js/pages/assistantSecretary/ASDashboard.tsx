import MainLayout from '@/layouts/MainLayout';

export default function ASDashboard() {
  return <div>Assistant Secretary Dashboard</div>;
}

ASDashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
