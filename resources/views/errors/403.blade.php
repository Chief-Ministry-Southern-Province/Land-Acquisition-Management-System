@extends('errors.layout')

@section('title', __('messages.error_403_title'))

@section('content')
    <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-10 w-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    </div>

    <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ __('messages.error_403_title') }}</h1>
    <span class="text-xs font-semibold uppercase text-destructive tracking-widest mt-1">HTTP 403 Forbidden</span>
    
    <p class="mt-4 text-sm text-muted-foreground">
        {{ __('messages.error_403_description') }}
    </p>

    <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <a href="/" class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring">
            {{ __('messages.error_back_to_home') }}
        </a>
    </div>
@endsection
