'use client';

import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/markets', key: 'marketPrices' },
  { href: '/prices', key: 'cropPrices' },
  { href: '/buyers', key: 'buyers' },
  { href: '/offers', key: 'offers' },
  { href: '/transactions', key: 'transactions' },
  { href: '/chatbot', key: 'chatbot' },
];

export default function SiteHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="KisanLink home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white shadow-sm">K</span>
          <span className="hidden sm:block">
            <span className="block text-base font-black leading-none text-slate-900">KisanLink</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Farmer first</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
              {link.key ? t(link.key) : link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="site-language">Select language</label>
          <select id="site-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 max-w-24 rounded-lg border-slate-200 bg-slate-50 px-1 text-xs font-semibold text-slate-700 sm:max-w-none sm:px-2">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="mr">मराठी</option>
            <option value="gu">ગુજરાતી</option>
            <option value="bn">বাংলা</option>
            <option value="ur">اردو</option>
          </select>
          {user?.loggedIn ? <button type="button" onClick={logout} className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:inline-flex">Logout</button> : <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:inline-flex">{t('login')}</Link>}
          {!user?.loggedIn && <Link href="/register" className="btn-primary px-3 py-2 text-sm">{t('getStarted')}</Link>}
          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700" aria-label="Open navigation menu">☰</summary>
            <nav className="absolute right-0 top-12 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              {links.map((link) => <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">{link.key ? t(link.key) : link.label}</Link>)}
              {user?.loggedIn ? <button type="button" onClick={logout} className="mt-1 block w-full border-t border-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-slate-700">Logout</button> : <Link href="/login" className="mt-1 block rounded-lg border-t border-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700">{t('login')}</Link>}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
