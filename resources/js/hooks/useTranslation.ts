import { usePage } from "@inertiajs/react";

export type Locale = 'en' | 'si';

interface TranslationPageProps {
    translations: Record<string, string>;
    locale: Locale;
    [key: string]: unknown;
}

export function useTranslation() {
    const { translations = {}, locale = 'en' } = usePage<TranslationPageProps>().props;

    const t = (key: string, fallback: string = key): string => {
        return translations[key] ?? fallback;
    };

    return { t, locale };
}