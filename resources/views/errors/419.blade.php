@extends('errors.layout')

@section('title', __('messages.error_419_title'))

@section('content')
    <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-10 w-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    </div>

    <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ __('messages.error_419_title') }}</h1>
    <span class="text-xs font-semibold uppercase text-accent tracking-widest mt-1">HTTP 419 Page Expired</span>
    
    <p class="mt-4 text-sm text-muted-foreground">
        {{ __('messages.error_419_description') }}
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
