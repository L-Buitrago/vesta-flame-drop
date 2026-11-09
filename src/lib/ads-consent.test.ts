/// <reference types="bun" />
import { describe, expect, it } from "bun:test";
import {
  canUseAdvertisingTracking,
  parseTraceRegion,
  requiresAdvertisingConsent,
} from "./ads-consent";

describe("advertising consent", () => {
  it("requires a choice in Brazil", () => {
    expect(requiresAdvertisingConsent("BR")).toBe(true);
  });

  it("allows ordinary tracking outside consent regions when there is no opt-out", () => {
    expect(
      canUseAdvertisingTracking({ region: "US", choice: null, globalPrivacyControl: false }),
    ).toBe(true);
  });

  it("blocks tracking when the region cannot be verified", () => {
    expect(
      canUseAdvertisingTracking({ region: "UNKNOWN", choice: null, globalPrivacyControl: false }),
    ).toBe(false);
  });

  it("keeps an explicit refusal effective outside consent regions", () => {
    expect(
      canUseAdvertisingTracking({ region: "US", choice: "denied", globalPrivacyControl: false }),
    ).toBe(false);
  });

  it("lets Global Privacy Control override a saved acceptance", () => {
    expect(
      canUseAdvertisingTracking({ region: "BR", choice: "granted", globalPrivacyControl: true }),
    ).toBe(false);
  });

  it("rejects a trace response from another host", () => {
    expect(parseTraceRegion("h=example.com\nloc=US", "vestajoias.lovable.app")).toBe("UNKNOWN");
  });

  it("accepts a same-host trace with a valid region", () => {
    expect(parseTraceRegion("h=vestajoias.lovable.app\nloc=BR", "vestajoias.lovable.app")).toBe("BR");
  });
});
