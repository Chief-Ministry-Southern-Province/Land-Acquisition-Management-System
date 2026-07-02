import MainLayout from '@/layouts/MainLayout';

export default function SystemSettings() {
  return (
    <div className="">
      <p>System settings</p>
    </div>
  );
}

SystemSettings.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
