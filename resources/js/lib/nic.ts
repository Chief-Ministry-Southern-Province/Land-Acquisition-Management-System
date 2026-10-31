export const SRI_LANKAN_NIC_PATTERN = /^(?:\d{12}|\d{9}[VvXx])$/;

export function normalizeNic(nic: string): string {
  return nic.trim().toUpperCase();
}

export function isValidNic(nic: string): boolean {
  return SRI_LANKAN_NIC_PATTERN.test(nic.trim());
}
