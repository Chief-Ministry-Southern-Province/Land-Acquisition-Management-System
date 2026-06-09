import { Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';

import SideBar from '@/components/SideBar';

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="bg-background flex h-screen overflow-hidden">
            <SideBar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-card border-border flex h-16 items-center justify-between border-b px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-muted rounded-lg p-2 transition-colors"
                        >
                            {sidebarOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>

                        {/* Breadcrumbs */}
                        {/* <nav className="flex items-center gap-2 text-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <div
                                    key={crumb.path}
                                    className="flex items-center gap-2"
                                >
                                    {index > 0 && (
                                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                                    )}
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="text-foreground">
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            to={crumb.path}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav> */}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button
                            // onClick={() => navigate('/notifications')}
                            className="hover:bg-muted relative rounded-lg p-2 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="bg-destructive absolute right-1 top-1 h-2 w-2 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <button
                            // onClick={() => navigate('/settings')}
                            className="hover:bg-muted rounded-lg p-2 transition-colors"
                        >
                            {/* <Settings className="h-5 w-5" /> */}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
