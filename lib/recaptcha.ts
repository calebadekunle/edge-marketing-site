import { getRecaptchaSettings } from "@/lib/db";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaCheck =
  | { required: false }
  | { required: true; passed: true }
  | { required: true; passed: false; reason: string };

// Call this from a form's API route before saving anything. If reCAPTCHA
// isn't enabled/configured, returns { required: false } immediately — the
// route should treat that exactly like today (no behavior change when the
// feature is off). Never throws: a Google outage fails the submission
// closed (passed: false) rather than crashing the route, since the whole
// point of this feature is to block suspicious submissions, not silently
// let them through if verification can't run.
export async function checkRecaptcha(
  token: string | null | undefined,
  remoteIp: string | null
): Promise<RecaptchaCheck> {
  const settings = getRecaptchaSettings();

  if (!settings.enabled || !settings.secret_key) {
    return { required: false };
  }

  if (!token) {
    return { required: true, passed: false, reason: "Missing reCAPTCHA token." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const params = new URLSearchParams({ secret: settings.secret_key, response: token });
    if (remoteIp) params.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    });

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };

    if (!data.success) {
      return {
        required: true,
        passed: false,
        reason: data["error-codes"]?.join(", ") || "reCAPTCHA verification failed.",
      };
    }
    return { required: true, passed: true };
  } catch (err) {
    console.error("[recaptcha] Verification request failed:", err);
    return {
      required: true,
      passed: false,
      reason: "Could not reach reCAPTCHA verification — try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
