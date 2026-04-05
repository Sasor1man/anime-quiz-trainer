export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>) {
  const clean = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  );
  return new URLSearchParams(clean as Record<string, string>).toString();
}