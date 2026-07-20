import { useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAD38ApDfLdPoyd12";

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "light" | "dark" | "auto";
      callback(token: string): void;
      "expired-callback"(): void;
      "error-callback"(): void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({
  onToken,
  resetSignal = 0,
  theme = "light",
}: {
  onToken: (token: string) => void;
  resetSignal?: number;
  theme?: "light" | "dark" | "auto";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const onTokenRef = useRef(onToken);
  const [error, setError] = useState("");
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    let retry: number | undefined;
    let attempts = 0;

    function render() {
      if (cancelled || !containerRef.current) return;
      if (!window.turnstile) {
        attempts += 1;
        if (attempts >= 100) {
          setError("The bot check could not load. Refresh the page and try again.");
          return;
        }
        retry = window.setTimeout(render, 100);
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "turnstile-spin-v1",
        theme,
        callback: (token) => {
          setError("");
          onTokenRef.current(token);
        },
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => {
          onTokenRef.current("");
          setError("The bot check needs another try.");
        },
      });
    }

    render();
    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
  }, [theme]);

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) return;
    onTokenRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  return (
    <div className="turnstile-field">
      <div ref={containerRef} data-action="turnstile-spin-v1" />
      {error && (
        <p className="turnstile-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
