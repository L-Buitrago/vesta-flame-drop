export const ADS_CONSENT_STORAGE_KEY = "vesta-ads-consent-v1";
export const ADS_CONSENT_NOTICE_VERSION = "2026-11-09";

const CONSENT_COUNTRIES = new Set([
  "BR",
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "GB",
  "CH",
  "CA",
  "AU",
  "JP",
  "KR",
  "ZA",
]);

export type AdsConsentChoice = "granted" | "denied";

export interface AdsConsentRecord {
  consentId: string;
  choice: AdsConsentChoice;
  decidedAt: string;
  noticeVersion: string;
  region: string;
  dataCategories: string[];
  purposes: string[];
  recipient: "Meta";
}

export function requiresAdvertisingConsent(region: string): boolean {
  const normalized = region.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === "XX" || normalized === "T1") {
    return true;
  }
  return CONSENT_COUNTRIES.has(normalized);
}

export function canUseAdvertisingTracking(input: {
  region: string;
  choice: AdsConsentChoice | null;
  globalPrivacyControl: boolean;
}): boolean {
  if (input.globalPrivacyControl || input.choice === "denied") return false;
  if (input.choice === "granted") return true;
  return !requiresAdvertisingConsent(input.region);
}

export function parseTraceRegion(trace: string, expectedHost: string): string {
  const values = new Map(
    trace
      .trim()
      .split("\n")
      .map((line) => line.split("=", 2) as [string, string])
      .filter(([key, value]) => Boolean(key && value)),
  );
  const host = values.get("h");
  const location = values.get("loc")?.toUpperCase() ?? "UNKNOWN";
  if (!host || host !== expectedHost) return "UNKNOWN";
  if (!/^[A-Z]{2}$/.test(location) || location === "XX" || location === "T1") {
    return "UNKNOWN";
  }
  return location;
}

export async function detectVisitorRegion(): Promise<string> {
  if (typeof window === "undefined") return "UNKNOWN";
  const cacheKey = "vesta-visitor-region-v1";
  try {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    // Region detection continues when session storage is unavailable.
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2000);
  let region = "UNKNOWN";
  try {
    const response = await fetch("/cdn-cgi/trace", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    });
    if (response.ok) {
      region = parseTraceRegion(await response.text(), window.location.host);
    }
  } catch {
    region = "UNKNOWN";
  } finally {
    window.clearTimeout(timeout);
  }

  try {
    window.sessionStorage.setItem(cacheKey, region);
  } catch {
    // The conservative result still applies without session storage.
  }
  return region;
}

export function readAdsConsentRecord(): AdsConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADS_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as Partial<AdsConsentRecord>;
    if (
      (record.choice !== "granted" && record.choice !== "denied") ||
      record.noticeVersion !== ADS_CONSENT_NOTICE_VERSION ||
      typeof record.region !== "string" ||
      typeof record.consentId !== "string" ||
      typeof record.decidedAt !== "string"
    ) {
      return null;
    }
    return record as AdsConsentRecord;
  } catch {
    return null;
  }
}

export function saveAdsConsentRecord(
  choice: AdsConsentChoice,
  region: string,
  previous: AdsConsentRecord | null,
): AdsConsentRecord | null {
  if (typeof window === "undefined") return null;
  const record: AdsConsentRecord = {
    consentId:
      previous?.consentId ??
      (typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    choice,
    decidedAt: new Date().toISOString(),
    noticeVersion: ADS_CONSENT_NOTICE_VERSION,
    region,
    dataCategories: ["navegação", "produtos visualizados", "sacola", "início de checkout"],
    purposes: ["medição e otimização de anúncios"],
    recipient: "Meta",
  };
  try {
    window.localStorage.setItem(ADS_CONSENT_STORAGE_KEY, JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}
