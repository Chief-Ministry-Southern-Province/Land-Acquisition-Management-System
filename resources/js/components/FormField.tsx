import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function FormField({ label, error, id, className = '', ...props }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <input
        id={id}
        className={`bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
