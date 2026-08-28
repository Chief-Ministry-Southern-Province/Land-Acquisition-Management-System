@extends('errors.layout')

@section('title', __('messages.error_500_title'))

@section('content')
    <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-10 w-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    </div>

    <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ __('messages.error_500_title') }}</h1>
    <span class="text-xs font-semibold uppercase text-destructive tracking-widest mt-1">HTTP 500 Server Error</span>
    
    <p class="mt-4 text-sm text-muted-foreground">
        {{ __('messages.error_500_description') }}
    </p>

    <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <button onclick="window.location.reload();" class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
            {{ __('messages.error_refresh_page') }}
        </button>
        <a href="/" class="inline-flex w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring">
            {{ __('messages.error_back_to_home') }}
        </a>
    </div>
@endsection
