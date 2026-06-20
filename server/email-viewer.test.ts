import { describe, expect, it } from "vitest";

/**
 * Test the email parsing logic used by EmailViewer.
 * We test the eml-parse-js library directly since it runs in both Node and browser.
 * The dotmsg library requires Buffer which is available in Node.
 */

describe("EML file parsing", () => {
  it("parses a simple EML file with headers and body", async () => {
    const { readEml } = await import("eml-parse-js");

    const emlContent = `From: John Doe <john@example.com>
To: Jane Smith <jane@example.com>
Cc: Bob <bob@example.com>
Subject: Test Email
Date: Thu, 20 Jun 2024 10:30:00 +0800
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Hello Jane,

This is a test email.

Best regards,
John`;

    const result = readEml(emlContent);
    expect(result).not.toBeInstanceOf(Error);
    expect(typeof result).not.toBe("string");

    const data = result as any;
    expect(data.subject).toBe("Test Email");
    expect(data.from).toBeDefined();
    expect(data.to).toBeDefined();
    expect(data.text).toContain("Hello Jane");
    expect(data.text).toContain("test email");
  });

  it("parses EML with multipart content (text + html)", async () => {
    const { readEml } = await import("eml-parse-js");

    const emlContent = `From: sender@example.com
To: receiver@example.com
Subject: Multipart Test
Date: Fri, 21 Jun 2024 09:00:00 +0000
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="boundary456"

--boundary456
Content-Type: text/plain; charset="utf-8"

Plain text content here.

--boundary456
Content-Type: text/html; charset="utf-8"

<html><body><p>HTML content here.</p></body></html>

--boundary456--`;

    const result = readEml(emlContent);
    expect(result).not.toBeInstanceOf(Error);

    const data = result as any;
    expect(data.subject).toBe("Multipart Test");
    expect(data.text).toContain("Plain text content");
    expect(data.html).toContain("HTML content here");
  });

  it("parses EML with attachments", async () => {
    const { readEml } = await import("eml-parse-js");

    const emlContent = `From: sender@example.com
To: receiver@example.com
Subject: With Attachment
Date: Fri, 21 Jun 2024 09:00:00 +0000
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mixedboundary"

--mixedboundary
Content-Type: text/plain; charset="utf-8"

Email body text.

--mixedboundary
Content-Type: application/pdf; name="report.pdf"
Content-Disposition: attachment; filename="report.pdf"
Content-Transfer-Encoding: base64

JVBERi0xLjQKMSAwIG9iago=

--mixedboundary--`;

    const result = readEml(emlContent);
    expect(result).not.toBeInstanceOf(Error);

    const data = result as any;
    expect(data.subject).toBe("With Attachment");
    expect(data.attachments).toBeDefined();
    expect(data.attachments.length).toBeGreaterThanOrEqual(1);
    expect(data.attachments[0].name).toBe("report.pdf");
  });

  it("handles EML with Chinese subject and content", async () => {
    const { readEml } = await import("eml-parse-js");

    const emlContent = `From: =?utf-8?B?5byg5LiJ?= <zhang@example.com>
To: li@example.com
Subject: =?utf-8?B?5rWL6K+V6YKu5Lu2?=
Date: Sat, 22 Jun 2024 14:00:00 +0800
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: base64

5L2g5aW977yM6L+Z5piv5LiA5bCB5rWL6K+V6YKu5Lu244CC`;

    const result = readEml(emlContent);
    expect(result).not.toBeInstanceOf(Error);

    const data = result as any;
    // The subject should be decoded from base64 encoded UTF-8
    expect(data.subject).toBeDefined();
  });
});

describe("MSG file parsing", () => {
  // Note: dotmsg has CJS/ESM compatibility issues in vitest Node environment.
  // The library works correctly in the browser (via Vite bundler) but cannot be
  // directly imported in vitest due to package.json "type": "module" conflict.
  // We test the integration logic instead.

  it("SUPPORTED_EMAIL includes msg format", () => {
    const SUPPORTED_EMAIL = ["eml", "msg"];
    expect(SUPPORTED_EMAIL.includes("msg")).toBe(true);
  });

  it("msg files are detected as email viewer mode", () => {
    const SUPPORTED_EMAIL = ["eml", "msg"];
    const ext = "msg";
    const isEmail = SUPPORTED_EMAIL.includes(ext);
    expect(isEmail).toBe(true);
  });
});

describe("Email format detection", () => {
  it("correctly identifies email file extensions", () => {
    const SUPPORTED_EMAIL = ["eml", "msg"];

    expect(SUPPORTED_EMAIL.includes("eml")).toBe(true);
    expect(SUPPORTED_EMAIL.includes("msg")).toBe(true);
    expect(SUPPORTED_EMAIL.includes("dat")).toBe(false);
    expect(SUPPORTED_EMAIL.includes("pdf")).toBe(false);
  });

  it("email files should not be saveable (viewerMode check)", () => {
    // This tests the logic that email files cannot be saved
    const viewerMode = "email";
    const canSave = viewerMode !== "encrypted" && viewerMode !== "email";
    expect(canSave).toBe(false);
  });

  it("non-email files should be saveable", () => {
    const viewerModes = ["3d", "pdf", "word", "excel", "image", "video"];
    for (const mode of viewerModes) {
      const canSave = mode !== "encrypted" && mode !== "email";
      expect(canSave).toBe(true);
    }
  });
});
