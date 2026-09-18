import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Two-Year Warranty",
  description: "The HEYWATCHES two-year warranty and how to request warranty support.",
};

export default function WarrantyPage() {
  return (
    <LegalDocument
      eyebrow="Client care"
      title="Two-Year Warranty"
      introduction={
        <p>
          Every eligible HEYWATCHES timepiece includes a two-year warranty beginning on
          the delivery date. This page explains the coverage and how to request support.
        </p>
      }
      sections={[
        {
          title: "What the warranty covers",
          content: (
            <p>
              The warranty covers manufacturing defects and mechanical faults that arise
              during normal use within the two-year coverage period. Any remedy is subject
              to inspection and confirmation that the issue falls within the warranty.
            </p>
          ),
        },
        {
          title: "What is not covered",
          content: (
            <p>
              The warranty does not cover normal wear, cosmetic changes, straps or batteries,
              accidental or water damage, misuse, loss, theft, or damage caused by repairs or
              alterations performed by an unauthorised third party.
            </p>
          ),
        },
        {
          title: "Requesting warranty support",
          content: (
            <p>
              Email <a href="mailto:Info@heywatches.com">Info@heywatches.com</a> with your
              order reference, a description of the issue, and clear photographs or video.
              We will provide the next steps and, where required, return instructions.
            </p>
          ),
        },
        {
          title: "Assessment and remedy",
          content: (
            <p>
              After inspection, an eligible fault may be repaired, replaced, or otherwise
              resolved as appropriate. This warranty is additional to any mandatory consumer
              rights that cannot legally be limited or excluded.
            </p>
          ),
        },
      ]}
    />
  );
}
