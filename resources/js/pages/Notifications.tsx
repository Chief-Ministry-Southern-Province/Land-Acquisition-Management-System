import MainLayout from '@/layouts/MainLayout';

export default function Notifications() {
    return <div>Notifications</div>;
}

Notifications.layout = (page: React.ReactNode) => (
    <MainLayout>{page}</MainLayout>
);
