import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HEYWATCHES collects, uses, stores, and shares personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Your information"
      title="Privacy Policy"
      introduction={
        <p>
          This policy explains how HEYWATCHES ("we", "us", or "our") handles personal
          information when you browse this website, place an order, or use our services.
          It should be read together with our Terms and Conditions.
        </p>
      }
      sections={[
        {
          title: "Information we collect",
          content: (
            <>
              <p>We may collect the following information when you use the site:</p>
              <ul>
                <li>Your name, email address, phone number, and delivery address.</li>
                <li>Order details, including products, quantities, prices, and order status.</li>
                <li>Payment and transaction information handled through Stripe. We do not receive or store your full card number.</li>
                <li>Technical information needed to operate and secure the site, such as IP address, browser type, device information, and server logs.</li>
                <li>Your shopping-bag contents, stored locally in your browser so they remain available between visits.</li>
              </ul>
            </>
          ),
        },
        {
          title: "How we use information",
          content: (
            <>
              <p>We use personal information to:</p>
              <ul>
                <li>create, process, deliver, and provide support for your order;</li>
                <li>process payments and prevent fraud or other misuse;</li>
                <li>communicate about purchases, delivery, warranty, returns, or service issues;</li>
                <li>maintain, troubleshoot, secure, and improve the website; and</li>
                <li>comply with legal, tax, accounting, and regulatory obligations.</li>
              </ul>
              <p>
                Where applicable law requires a legal basis, we process information to perform
                our contract with you, meet legal obligations, and pursue legitimate interests
                such as fraud prevention and service security. We rely on consent where required.
              </p>
            </>
          ),
        },
        {
          title: "Service providers and disclosures",
          content: (
            <>
              <p>
                We use <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">Stripe</a> to
                process payments, Supabase to store order records, and Vercel to host and deliver
                the website. These providers may process information in other countries under
                their own security and privacy safeguards.
              </p>
              <p>
                We may also disclose information to delivery providers, professional advisers,
                authorities where legally required, or a successor in a legitimate business
                transaction. We do not sell personal information or use it for cross-context
                behavioural advertising based on the website's current functionality.
              </p>
            </>
          ),
        },
        {
          title: "Cookies and browser storage",
          content: (
            <p>
              The website uses essential browser storage to remember your shopping bag. Stripe
              may use cookies or similar technologies on its hosted checkout for payment,
              security, fraud prevention, and service operation. Clearing your browser storage
              may remove saved bag contents. We do not currently use advertising cookies on this site.
            </p>
          ),
        },
        {
          title: "Retention and security",
          content: (
            <>
              <p>
                We retain order and transaction records only as long as reasonably necessary to
                fulfil orders, provide warranty support, resolve disputes, prevent fraud, and meet
                legal, tax, or accounting requirements. Retention periods may vary by record and jurisdiction.
              </p>
              <p>
                We use reasonable administrative and technical safeguards, but no online system
                can be guaranteed completely secure. Payment card details are entered directly in Stripe's checkout.
              </p>
            </>
          ),
        },
        {
          title: "Your privacy choices and rights",
          content: (
            <>
              <p>
                Depending on where you live, you may have rights to request access, correction,
                deletion, restriction, objection, portability, or withdrawal of consent. You may
                also complain to your local data-protection authority.
              </p>
              <p>
                To make a request, use the customer-support contact provided in your order
                confirmation. We may need to verify your identity before completing a request.
                Some information may be retained where law requires or permits it.
              </p>
            </>
          ),
        },
        {
          title: "Children and policy updates",
          content: (
            <>
              <p>
                This site is not directed to children, and we do not knowingly collect personal
                information from children. If you believe a child has provided information, contact us.
              </p>
              <p>
                We may update this policy when our practices, providers, or legal obligations
                change. The effective date above identifies the current version.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
