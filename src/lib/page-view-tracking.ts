import { useEffect } from "react";

const SESSION_KEY = "deerva_sid";

/** A visit only counts once the person stayed this long or interacted. */
const ENGAGEMENT_MS = 5000;

function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "anon";
  }
}

function send(payload: Record<string, unknown>, beacon: boolean) {
  const body = JSON.stringify(payload);
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/public/pv", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch("/api/public/pv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * First-party page-view tracking for the public site. No cookies, no third
 * parties. A view is only recorded after real engagement (5s or an
 * interaction), which keeps trivial bots and accidental bounces out of the
 * numbers; the final dwell time is sent when the page is left.
 */
export function usePageViewTracking(pathname: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const id = crypto.randomUUID();
    const startedAt = Date.now();
    const base = {
      id,
      path: pathname.slice(0, 2048),
      sessionId: sessionId(),
      referrer: (document.referrer || "").slice(0, 2048),
    };

    let recorded = false;
    const record = () => {
      if (recorded) return;
      recorded = true;
      cleanupTriggers();
      send({ ...base, durationMs: Date.now() - startedAt }, false);
    };

    const timer = window.setTimeout(record, ENGAGEMENT_MS);
    const onInteract = () => record();
    window.addEventListener("scroll", onInteract, { passive: true, once: true });
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });

    function cleanupTriggers() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
    }

    const flush = () => {
      if (!recorded) return;
      send({ ...base, durationMs: Date.now() - startedAt }, true);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cleanupTriggers();
      flush();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname, enabled]);
}
