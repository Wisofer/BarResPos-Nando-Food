import { useEffect, useMemo } from "react";

/**
 * Genera una object URL para un `File` y la revoca al cambiar o desmontar.
 * @param {File | null | undefined} file
 * @returns {string | null}
 */
export function useObjectUrlForFile(file) {
  const url = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return url;
}
