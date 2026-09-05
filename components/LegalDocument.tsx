import Link from "next/link";
import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  introduction: ReactNode;
  sections: LegalSection[];
};

export default function LegalDocument({
  eyebrow,
  title,
  introduction,
  sections,
}: LegalDocumentProps) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-light text-parchment sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-bone/40">
          Effective September 5, 2026
        </p>
        <div className="mt-8 border-l border-gold/50 pl-5 text-sm leading-7 text-bone/65 sm:pl-7">
          {introduction}
        </div>
      </div>

      <div className="rule my-12" />

      <div className="max-w-3xl space-y-12">
        {sections.map((section, index) => (
          <section key={section.title} aria-labelledby={`legal-section-${index}`}>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-lg italic text-gold/60" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2
                id={`legal-section-${index}`}
                className="font-display text-2xl font-light text-parchment sm:text-3xl"
              >
                {section.title}
              </h2>
            </div>
            <div className="mt-5 space-y-4 pl-0 text-sm leading-7 text-bone/65 sm:pl-11 [&_a]:text-gold [&_a]:underline-offset-4 hover:[&_a]:text-gold-light [&_li]:pl-2 [&_strong]:font-semibold [&_strong]:text-parchment/90 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border border-line bg-charcoal/60 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <p className="eyebrow">Continue browsing</p>
          <p className="mt-2 font-display text-2xl text-parchment">Return to the collection.</p>
        </div>
        <Link
          href="/shop"
          className="mt-5 inline-flex bg-gold px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-obsidian transition-colors hover:bg-gold-light sm:mt-0"
        >
          Shop all watches
        </Link>
      </div>
    </main>
  );
}
