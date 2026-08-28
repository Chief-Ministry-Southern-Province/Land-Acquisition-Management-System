<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script>
            (function() {
                try {
                    const theme = localStorage.getItem('theme') || 'system';
                    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <link rel="icon" href="/logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/logo.png">

        @fonts

        @vite(['resources/css/app.css'])
        <title>@yield('title') - {{ config('app.name', 'Laravel') }}</title>
    </head>
    <body class="font-sans antialiased bg-background text-foreground flex min-h-screen items-center justify-center p-4 transition-colors duration-200">
        <div class="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div class="flex flex-col items-center text-center">
                @yield('content')
            </div>
        </div>
    </body>
</html>
