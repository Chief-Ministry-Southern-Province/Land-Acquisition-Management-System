import MainLayout from '@/layouts/MainLayout';

export default function SecretaryDashboard() {
  return <div>Secretary Dashboard</div>;
}

SecretaryDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
