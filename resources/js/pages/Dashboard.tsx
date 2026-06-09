import MainLayout from '@/layouts/MainLayout';

export default function Dashboard() {
    return <div>dashboard</div>;
}

Dashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
