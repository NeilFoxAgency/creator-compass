import { describe, expect, it } from "vitest";
import { extractPage, ingestUserText, validatePublicUrl } from "./ingestion";

describe("safe URL validation", () => {
  it.each(["http://localhost", "http://127.0.0.1", "http://10.2.3.4", "http://169.254.169.254/latest", "http://[::1]", "file:///etc/passwd", "https://user:pass@example.com", "https://example.com:8443"])("rejects %s", (url) => expect(() => validatePublicUrl(url)).toThrow());
  it("normalizes a public URL", () => expect(validatePublicUrl("HTTPS://WWW.Example.com:443/path#x").toString()).toBe("https://www.example.com/path"));
});

describe("HTML extraction", () => {
  it("extracts useful text without scripts, navigation, or cookie text", () => {
    const page = extractPage(`<html><head><title>Acme Tools</title><meta name="description" content="Tools for careful makers"></head><body><nav>Cookie settings</nav><h1>Build with confidence</h1><p>Our precision tools help home craftspeople complete safer projects.</p><script>alert(1)</script></body></html>`, "https://example.com");
    expect(page.text).toContain("Build with confidence");
    expect(page.text).not.toContain("alert");
    expect(page.text).not.toContain("Cookie settings");
  });
  it("creates bounded evidence from provided text", () => expect(ingestUserText("A".repeat(900)).evidence.length).toBeGreaterThan(1));
});

