import { useState, useCallback } from "react";

/**
 * Hook for managing backup codes display state.
 *
 * Tracks an array of backup codes and a `generated` flag used to
 * conditionally show or hide the codes after generation.
 *
 * @returns An object with `backupCodes` (current array), `setCodes` (callback
 *          to populate codes and mark as generated), and `generated` (boolean).
 *
 * @example
 * ```tsx
 * function BackupCodesSection() {
 *   const { backupCodes, setCodes, generated } = useBackupCodes();
 *   return generated ? <BackupCodesDisplay codes={backupCodes} /> : null;
 * }
 * ```
 */
export function useBackupCodes() {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const setCodes = useCallback((codes: string[]) => {
    setBackupCodes(codes);
    setGenerated(true);
  }, []);

  return { backupCodes, setCodes, generated };
}
