import { useState, useEffect } from "react";

const DEFAULT_NAME = "BarRestPOS";
const NAME_UPDATED_EVENT = "pos_app_name_updated";

export function useAppName() {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("pos_app_name") || DEFAULT_NAME;
    } catch {
      return DEFAULT_NAME;
    }
  });

  useEffect(() => {
    const handleNameUpdate = () => {
      try {
        setName(localStorage.getItem("pos_app_name") || DEFAULT_NAME);
      } catch {
        setName(DEFAULT_NAME);
      }
    };

    window.addEventListener(NAME_UPDATED_EVENT, handleNameUpdate);
    return () => {
      window.removeEventListener(NAME_UPDATED_EVENT, handleNameUpdate);
    };
  }, []);

  return name;
}
