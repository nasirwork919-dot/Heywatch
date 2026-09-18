import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How HEYWATCHES uses essential cookies and browser storage.",
};

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      eyebrow="Browser storage"
      title="Cookie Policy"
      introduction={
        <p>
          This policy explains how HEYWATCHES uses essential cookies and similar browser
          storage to provide the website and remember your choices.
        </p>
      }
      sections={[
        {
          title: "What we use",
          content: (
            <p>
              We use essential browser storage for your shopping bag, cookie acceptance,
              and pending checkout progress. These records help the website function between
              pages and visits on the same browser.
            </p>
          ),
        },
        {
          title: "What we do not use",
          content: (
            <p>
              The website does not currently use advertising cookies or cross-site behavioural
              tracking. If that changes, this policy and the consent experience will be updated.
            </p>
          ),
        },
        {
          title: "Managing stored data",
          content: (
            <p>
              You can clear cookies and site data in your browser settings. Doing so may remove
              your saved shopping bag, pending checkout information, and cookie preference.
            </p>
          ),
        },
        {
          title: "Contact",
          content: (
            <p>
              Questions about cookies or browser storage can be sent to{" "}
              <a href="mailto:Info@heywatches.com">Info@heywatches.com</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
