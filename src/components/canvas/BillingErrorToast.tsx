import React from "react";

export function BillingErrorToast() {
  return (
    <div className="text-center">
      <p>Google Requires Billing Enabled</p>
      <p>Please set up billing on your Google account.</p>
      <a
        href="https://ai.google.dev/gemini-api/docs/billing"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        https://ai.google.dev/gemini-api/docs/billing
      </a>
    </div>
  );
}
