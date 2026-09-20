import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "International Shipping",
  description:
    "Complimentary worldwide shipping, tracking, customs, and delivery information from HEYWATCHES.",
};

export default function ShippingPage() {
  return (
    <LegalDocument
      eyebrow="Client care"
      title="International Shipping"
      introduction={
        <p>
          HEYWATCHES provides complimentary worldwide shipping for every confirmed
          order. The information below explains order preparation, tracking, customs,
          and delivery.
        </p>
      }
      sections={[
        {
          title: "Free worldwide shipping",
          content: (
            <p>
              Standard shipping is free to supported destinations worldwide. If a
              carrier cannot deliver to your address, we will contact you before the
              order is dispatched.
            </p>
          ),
        },
        {
          title: "Processing and tracking",
          content: (
            <p>
              Orders are prepared after payment has been verified. Once your order is
              dispatched, tracking details will be sent by email or WhatsApp. Delivery
              estimates vary by destination, carrier, and customs processing.
            </p>
          ),
        },
        {
          title: "Customs and import charges",
          content: (
            <p>
              Complimentary shipping covers the carrier charge. Import duties, taxes,
              and customs fees may still be charged by the destination country and are
              the recipient&apos;s responsibility unless we state otherwise before purchase.
            </p>
          ),
        },
        {
          title: "Delivery support",
          content: (
            <p>
              A signature may be required on delivery. Please provide an accurate
              shipping address and inspect the package when it arrives. For assistance,
              email <a href="mailto:Info@heywatches.com">Info@heywatches.com</a> or
              contact us on{" "}
              <a href="https://wa.me/4550280975" target="_blank" rel="noreferrer">
                WhatsApp at +45 50 28 09 75
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
