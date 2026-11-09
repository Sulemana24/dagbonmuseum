import Link from "next/link";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { getSiteSettings } from "@/lib/services/content";
import { mainNav } from "@/lib/site-config";

export async function Footer() {
  const s = await getSiteSettings();
  const { email, phone, address, openingHours, social } = s;
  return (
    <footer className="mt-24 bg-forest-deep text-cream/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="md:col-span-1">
          <p className="font-serif text-xl text-cream">{s.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{s.description}</p>
          <div className="mt-6"><h2 className="!text-gold text-base">Newsletter</h2>{s.newsletterEnabled === false ? <p className="mt-2 text-sm text-cream/60">Subscriptions are closed right now.</p> : <div className="mt-2"><NewsletterForm consentText={s.newsletterConsent} /></div>}</div>
        </div>
        <nav aria-label="Footer">
          <h2 className="!text-gold text-base">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}><Link href={item.href} className="hover:text-gold">{item.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <h2 className="!text-gold text-base">Visit and contact</h2>
          <dl className="mt-3 space-y-2">
            <div><dt className="text-cream/60">Address</dt><dd>{address}</dd></div>
            <div><dt className="text-cream/60">Opening hours</dt><dd>{openingHours}</dd></div>
            <div><dt className="text-cream/60">Email</dt><dd>{email}</dd></div>
            <div><dt className="text-cream/60">Phone</dt><dd>{phone}</dd></div>
          </dl>
        </div>
        <div className="text-sm">
          <h2 className="!text-gold text-base">Follow</h2>
          {social.length ? (
            <ul className="mt-3 space-y-2">
              {social.map((s) => (
                <li key={s.href}><a href={s.href} rel="noopener noreferrer" className="hover:text-gold">{s.label}</a></li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-cream/60">Social links will appear once verified.</p>
          )}
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-cream/60">
          <p>{s.footerNote && <span className="mr-3">{s.footerNote}</span>}&copy; {new Date().getFullYear()} {s.name}. All rights reserved.</p>
          <p className="flex gap-4"><Link href="/privacy" className="hover:text-gold">Privacy policy</Link><Link href="/terms" className="hover:text-gold">Terms of use</Link></p>
        </div>
      </div>
    </footer>
  );
}
