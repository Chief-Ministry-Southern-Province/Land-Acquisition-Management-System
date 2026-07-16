import MainLayout from '@/layouts/MainLayout';

export default function SASDashboard() {
  return <div>Senior Assistant Secretary Dashboard</div>;
}

SASDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
