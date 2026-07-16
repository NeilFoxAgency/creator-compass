import { describe, expect, it } from "vitest";
import { isSampleReport, stripOuterQuotationMarks } from "./display";

describe("report display helpers", () => {
  it("recognizes only the bundled sample report", () => {
    expect(isSampleReport("sample-neil-fox-agency")).toBe(true);
    expect(isSampleReport("neilfoxagency-com-live")).toBe(false);
  });

  it("removes repeated outer quotation marks without changing internal punctuation", () => {
    expect(stripOuterQuotationMarks("““A useful opening hook.””")).toBe("A useful opening hook.");
    expect(stripOuterQuotationMarks('"A creator\'s honest test"')).toBe("A creator's honest test");
    expect(stripOuterQuotationMarks("No outer quotation marks")).toBe("No outer quotation marks");
  });
});
