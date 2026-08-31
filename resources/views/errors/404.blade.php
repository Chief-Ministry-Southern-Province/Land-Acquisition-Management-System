@extends('errors.layout')

@section('title', __('messages.error_404_title'))

@section('content')
    <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-10 w-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>

    <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ __('messages.error_404_title') }}</h1>
    <span class="text-xs font-semibold uppercase text-warning tracking-widest mt-1">HTTP 404 Not Found</span>
    
    <p class="mt-4 text-sm text-muted-foreground">
        {{ __('messages.error_404_description') }}
    </p>

    <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <a href="/" class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring">
            {{ __('messages.error_back_to_home') }}
        </a>
    </div>
@endsection
