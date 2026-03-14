/**
 * Safely extract a single string param from Express 5 params.
 * Express 5 types req.params values as string | string[].
 */
export function paramStr(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0];
  return val || '';
}
