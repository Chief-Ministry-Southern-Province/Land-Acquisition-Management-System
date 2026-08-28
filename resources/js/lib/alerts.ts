import Swal from 'sweetalert2';

// Base styling classes using Tailwind CSS and custom theme variables
const basePopupClass =
  'rounded-xl border border-border bg-card text-foreground shadow-xl font-sans p-6 max-w-md';
const baseTitleClass = 'text-lg font-semibold text-foreground mt-2';
const baseHtmlContainerClass =
  'text-sm text-muted-foreground mt-2 whitespace-pre-line';
const baseActionsClass = 'flex gap-3 justify-end mt-6 w-full';

const baseConfirmButtonClass =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-white cursor-pointer';
const baseCancelButtonClass =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-border bg-muted/50 text-muted-foreground hover:bg-muted/80 cursor-pointer';

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

/**
 * Destructive confirmation dialog (e.g., delete actions, database restores).
 * Uses warning icon and a red/destructive confirm button.
 */
export async function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'warning',
    iconColor: 'var(--warning)',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Delete',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    buttonsStyling: false,
    customClass: {
      popup: basePopupClass,
      title: baseTitleClass,
      htmlContainer: baseHtmlContainerClass,
      actions: baseActionsClass,
      confirmButton: `${baseConfirmButtonClass} bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive`,
      cancelButton: baseCancelButtonClass,
    },
  });

  return result.isConfirmed;
}

/**
 * Non-destructive confirmation dialog (e.g., workflow progression, submissions).
 * Uses neutral/primary styling.
 */
export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'question',
    iconColor: 'var(--info)',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Confirm',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    buttonsStyling: false,
    customClass: {
      popup: basePopupClass,
      title: baseTitleClass,
      htmlContainer: baseHtmlContainerClass,
      actions: baseActionsClass,
      confirmButton: `${baseConfirmButtonClass} bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary`,
      cancelButton: baseCancelButtonClass,
    },
  });

  return result.isConfirmed;
}

//  Information alert modal. Useful for blocking messages (like permission errors or detailed validation reports).
export async function alertInfo(title: string, text?: string): Promise<void> {
  await Swal.fire({
    title,
    text,
    icon: 'info',
    iconColor: 'var(--info)',
    confirmButtonText: 'OK',
    buttonsStyling: false,
    customClass: {
      popup: basePopupClass,
      title: baseTitleClass,
      htmlContainer: baseHtmlContainerClass,
      actions: baseActionsClass,
      confirmButton: `${baseConfirmButtonClass} bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary`,
    },
  });
}

// Reusable centered alert popup helper
const AlertPopup = Swal.mixin({
  position: 'center',
  showConfirmButton: true,
  confirmButtonText: 'OK',
  timer: 3000,
  timerProgressBar: true,
  buttonsStyling: false,
  customClass: {
    popup: basePopupClass,
    title: baseTitleClass,
    htmlContainer: baseHtmlContainerClass,
    actions: baseActionsClass,
    confirmButton: `${baseConfirmButtonClass} bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary`,
  },
});

//  Centered success alert popup (auto-dismisses after 3s, or via OK button).
export async function alertSuccess(message: string): Promise<void> {
  await AlertPopup.fire({
    icon: 'success',
    iconColor: 'var(--success)',
    title: 'Success',
    text: message,
  });
}

//  Centered error alert popup (auto-dismisses after 4s, or via OK button).
export async function alertError(message: string): Promise<void> {
  await AlertPopup.fire({
    icon: 'error',
    iconColor: 'var(--destructive)',
    title: 'Error',
    text: message,
    timer: 4000,
  });
}

export function toastSuccess(message: string): void {
  alertSuccess(message);
}

export function toastError(message: string): void {
  alertError(message);
}
