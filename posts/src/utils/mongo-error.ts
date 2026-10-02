// utils/errors.ts
export const MONGO_DUPLICATE_KEY_ERROR = 11000;

export function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as any).code === MONGO_DUPLICATE_KEY_ERROR
  );
}
