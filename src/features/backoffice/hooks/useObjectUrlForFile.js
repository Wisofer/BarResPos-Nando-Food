import { useEffect, useState } from "react";

/**
 * Genera una object URL para un `File` y la revoca al cambiar o desmontar.
 * @param {File | null | undefined} file
 * @returns {string | null}
 */
export function useObjectUrlForFile(file) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return objectUrl;
}
