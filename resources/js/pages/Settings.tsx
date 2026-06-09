import MainLayout from '@/layouts/MainLayout';

export default function Settings() {
    return <div>Settings</div>;
}

Settings.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
