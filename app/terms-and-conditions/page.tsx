import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms governing purchases and use of the HEYWATCHES website.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalDocument
      eyebrow="Website and purchase terms"
      title="Terms and Conditions"
      introduction={
        <p>
          These terms govern your use of the HEYWATCHES website and any order you place.
          By using the site or submitting an order, you agree to these terms. If you do not
          agree, do not use the site or place an order.
        </p>
      }
      sections={[
        {
          title: "Eligibility and acceptable use",
          content: (
            <p>
              You must be legally able to enter a contract and provide accurate, complete order
              information. You may not misuse the site, interfere with its operation, attempt
              unauthorised access, introduce malicious code, scrape it in a way that disrupts the
              service, or use it for unlawful or fraudulent activity.
            </p>
          ),
        },
        {
          title: "Product identity and brand disclosure",
          content: (
            <>
              <p>
                <strong>Important:</strong> products described as "replica", "super clone", or
                similar are independently manufactured imitation or homage products. They are not
                authentic products made, authorised, sponsored, or endorsed by the luxury brands
                named in product titles or descriptions.
              </p>
              <p>
                Brand names and trademarks are used for product identification and compatibility
                description only and remain the property of their respective owners. Nothing on
                this site represents an official dealership or brand affiliation. Do not purchase
                if you require an authentic manufacturer-issued product.
              </p>
            </>
          ),
        },
        {
          title: "Product information and availability",
          content: (
            <p>
              We aim to present descriptions, specifications, colours, and images accurately, but
              screen settings and manufacturing variations may affect appearance. Availability is
              not guaranteed. We may correct errors, update information, limit quantities, refuse
              an order, or withdraw a product before an order is accepted.
            </p>
          ),
        },
        {
          title: "Prices, orders, and payment",
          content: (
            <>
              <p>
                Prices are displayed in the currency identified on the site. Shipping charges,
                duties, taxes, and currency-conversion costs may be additional unless expressly
                included. Your cart or checkout submission is an offer to purchase, not our acceptance.
              </p>
              <p>
                We accept bank transfers and supported cryptocurrencies. Bank-transfer details may
                be provided by client care for an eligible order. Cryptocurrency payments use the
                asset, destination address, and blockchain network shown at checkout. You are
                responsible for using those exact details. Blockchain transfers are irreversible,
                and funds sent using an unsupported asset, address, or network may be permanently lost.
              </p>
              <p>
                The USD total is the order's reference value. Where checkout instructs you to send
                the USD equivalent in a crypto asset, conversion rates and network fees shown by
                your wallet or exchange may vary. The order is not paid or accepted merely because
                a transaction hash was submitted; it remains pending until we verify the correct
                transfer on-chain and confirm acceptance. We may cancel and refund an order if a
                product is unavailable, incorrectly priced, prohibited, or suspected of fraud.
              </p>
            </>
          ),
        },
        {
          title: "Shipping, customs, and delivery",
          content: (
            <>
              <p>
                Delivery estimates are not guarantees. Delays may occur because of carriers,
                customs, weather, address issues, or events outside reasonable control. You are
                responsible for providing a complete deliverable address and for applicable import
                duties, taxes, and lawful import requirements unless we state otherwise.
              </p>
              <p>
                We will not knowingly accept or ship an order where the transaction is prohibited.
                Risk and title transfer only as provided by applicable law and the delivery terms
                communicated with your order.
              </p>
            </>
          ),
        },
        {
          title: "Cancellations, returns, and warranty",
          content: (
            <>
              <p>
                Contact the customer-support channel in your order confirmation promptly if you
                need to change or cancel an order. Once processing or shipment has begun, changes
                may not be possible.
              </p>
              <p>
                Return eligibility, instructions, and any exclusions will be communicated for the
                relevant order. Products advertised with a two-year warranty are covered for the
                scope described in the warranty communication supplied with the order. Misuse,
                accidental damage, unauthorised repairs, normal wear, and cosmetic deterioration
                may be excluded. Nothing in these terms limits mandatory consumer rights that cannot
                legally be excluded.
              </p>
            </>
          ),
        },
        {
          title: "Intellectual property",
          content: (
            <p>
              The website design, HEYWATCHES branding, text, and original site materials are owned
              by or licensed to us and may not be copied or commercially exploited without permission.
              Third-party product names, marks, and imagery belong to their respective owners.
            </p>
          ),
        },
        {
          title: "Liability and legal rights",
          content: (
            <>
              <p>
                To the fullest extent permitted by law, we are not liable for indirect,
                consequential, or unforeseeable loss arising from use of the site. We do not exclude
                liability that cannot lawfully be excluded, including liability for fraud or certain
                personal injuries where applicable.
              </p>
              <p>
                These terms are governed by the mandatory laws and courts that apply to the operator
                and your transaction. Any rights you have under the mandatory consumer law of your
                place of residence remain unaffected.
              </p>
            </>
          ),
        },
        {
          title: "Privacy, changes, and contact",
          content: (
            <>
              <p>
                Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we handle personal
                information. We may update these terms prospectively by publishing a revised version
                and effective date. The terms in force when an accepted order is placed continue to
                govern that order unless law requires otherwise.
              </p>
              <p>
                For order or legal questions, email{" "}
                <a href="mailto:Info@heywatches.com">Info@heywatches.com</a> and include your
                order reference. Notices to you may be sent to the email address supplied at checkout.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
