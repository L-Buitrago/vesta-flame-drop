import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ADS_CONSENT_STORAGE_KEY,
  canUseAdvertisingTracking,
  detectVisitorRegion,
  readAdsConsentRecord,
  requiresAdvertisingConsent,
  saveAdsConsentRecord,
  type AdsConsentChoice,
  type AdsConsentRecord,
} from "@/lib/ads-consent";
import { setMetaPixelPermission } from "@/lib/meta-pixel";

interface AdsConsentContextValue {
  ready: boolean;
  allowed: boolean;
  openSettings: () => void;
}

const AdsConsentContext = createContext<AdsConsentContextValue | null>(null);

export function openAdsConsentSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vesta:open-privacy-settings"));
  }
}

export function AdsConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [region, setRegion] = useState("UNKNOWN");
  const [record, setRecord] = useState<AdsConsentRecord | null>(null);
  const [globalPrivacyControl, setGlobalPrivacyControl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const navigatorWithGpc = navigator as Navigator & { globalPrivacyControl?: boolean };
    const gpc = navigatorWithGpc.globalPrivacyControl === true;
    const stored = readAdsConsentRecord();
    setGlobalPrivacyControl(gpc);
    setRecord(stored);

    void detectVisitorRegion().then((detected) => {
      if (!active) return;
      setRegion(detected);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === ADS_CONSENT_STORAGE_KEY) {
        setRecord(readAdsConsentRecord());
      }
    };
    window.addEventListener("vesta:open-privacy-settings", open);
    window.addEventListener("storage", syncAcrossTabs);
    return () => {
      window.removeEventListener("vesta:open-privacy-settings", open);
      window.removeEventListener("storage", syncAcrossTabs);
    };
  }, []);

  const allowed = canUseAdvertisingTracking({
    region,
    choice: record?.choice ?? null,
    globalPrivacyControl,
  });

  useEffect(() => {
    if (ready) setMetaPixelPermission(allowed, record?.choice === "granted");
  }, [allowed, ready, record?.choice]);

  const decide = useCallback(
    (choice: AdsConsentChoice) => {
      if (globalPrivacyControl && choice === "granted") return;
      const saved = saveAdsConsentRecord(choice, region, record);
      if (saved) setRecord(saved);
      setSettingsOpen(false);
    },
    [globalPrivacyControl, record, region],
  );

  const value = useMemo(
    () => ({ ready, allowed, openSettings: () => setSettingsOpen(true) }),
    [allowed, ready],
  );
  const showBanner =
    ready &&
    (settingsOpen ||
      (!record && !globalPrivacyControl && requiresAdvertisingConsent(region)));

  return (
    <AdsConsentContext.Provider value={value}>
      {children}
      {showBanner && (
        <aside className="privacy-banner" aria-label="Privacidade e cookies">
          <div className="privacy-banner-copy">
            <strong>Sua privacidade, sua escolha</strong>
            <p>
              Usamos cookies da Meta para medir e melhorar nossos anúncios. Você pode aceitar ou
              recusar. Saiba mais na <Link to="/privacidade">Política de Privacidade</Link>.
            </p>
            {globalPrivacyControl && (
              <p>Seu navegador solicitou que o rastreamento permaneça desativado.</p>
            )}
          </div>
          <div className="privacy-banner-actions">
            <button type="button" className="privacy-button privacy-button-secondary" onClick={() => decide("denied")}>
              Recusar
            </button>
            <button
              type="button"
              className="privacy-button privacy-button-primary"
              onClick={() => decide("granted")}
              disabled={globalPrivacyControl}
            >
              Aceitar
            </button>
          </div>
        </aside>
      )}
    </AdsConsentContext.Provider>
  );
}

export function useAdsConsent() {
  const context = useContext(AdsConsentContext);
  if (!context) throw new Error("useAdsConsent must be used inside AdsConsentProvider");
  return context;
}
