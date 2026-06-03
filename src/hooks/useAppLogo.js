import { useState, useEffect } from "react";
import { resolveBackendAssetUrl } from "../features/backoffice/utils/backofficePrint.js";

const DEFAULT_LOGO = "assets/images/barrespos.png";
const LOGO_UPDATED_EVENT = "pos_logo_updated";

export function useAppLogo() {
  const [logo, setLogo] = useState(() => {
    try {
      const cached = localStorage.getItem("pos_logo_url");
      return cached ? resolveBackendAssetUrl(cached) : DEFAULT_LOGO;
    } catch {
      return DEFAULT_LOGO;
    }
  });

  useEffect(() => {
    const handleLogoUpdate = () => {
      try {
        const cached = localStorage.getItem("pos_logo_url");
        setLogo(cached ? resolveBackendAssetUrl(cached) : DEFAULT_LOGO);
      } catch {
        setLogo(DEFAULT_LOGO);
      }
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleLogoUpdate);
    return () => {
      window.removeEventListener(LOGO_UPDATED_EVENT, handleLogoUpdate);
    };
  }, []);

  return logo;
}
