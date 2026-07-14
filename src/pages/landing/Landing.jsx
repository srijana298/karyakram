import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoArrowForward,
  IoCalendarOutline,
  IoLinkOutline,
  IoCheckmarkCircleOutline,
  IoPeopleOutline,
  IoTicketOutline,
  IoGlobeOutline,
  IoSparkles
} from '../../components/icons';
import { RiGithubFill, RiInstagramLine, RiTwitterLine } from '../../components/icons';

// Live Kathmandu clock for the header (mirrors the reference "GMT+5:45").
function useNepalClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kathmandu',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function PhoneHero() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] select-none">
      <div className="pointer-events-none absolute inset-[18%] rounded-full bg-violet-600/20 blur-3xl" />
      <img
        src="/herosection.png"
        alt="Mahotsav event experience preview"
        className="relative block w-full h-auto object-contain border-0 outline-none shadow-none"
      />
    </div>
  );
}

function Landing() {
  const time = useNepalClock();

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  let token = null;
  try {
    token = JSON.parse(localStorage.getItem('token'));
  } catch {
    token = null;
  }

  const features = [
    {
      icon: <IoCalendarOutline />,
      title: 'Create Events',
      description:
        'Set up a beautiful event page in minutes — dates, location, cover image, and more.'
    },
    {
      icon: <IoTicketOutline />,
      title: 'Manage RSVPs',
      description: "Approve guests or auto-confirm them, and track who's coming from one place."
    },
    {
      icon: <IoPeopleOutline />,
      title: 'Go Live',
      description:
        'Host online or in-person, check guests in with QR codes, and issue certificates.'
    },
    {
      icon: <IoGlobeOutline />,
      title: 'Free & Local',
      description: 'Built for Nepal — free to host, with Khalti & eSewa when you need them.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Event',
      description: 'Fill in the details, add a poster, and pick a calendar.'
    },
    {
      number: '02',
      title: 'Share & RSVP',
      description: 'Share the link and let people RSVP with one tap.'
    },
    {
      number: '03',
      title: 'Manage & Celebrate',
      description: 'Track RSVPs, scan check-ins, and host a great event.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Events Created' },
    { value: '10K+', label: 'RSVPs Processed' },
    { value: '200+', label: 'Organizers' },
    { value: '50+', label: 'Cities Reached' }
  ];

  return (
    <div className="flex-1 bg-[#0a0a0b] text-white font-sans">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* background wash */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_10%,rgba(124,58,237,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_10%_90%,rgba(16,185,129,0.10),transparent_60%)]" />

        {/* Header */}
        <header className="relative z-10">
          <div className="container flex items-center justify-between h-16">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight text-white"
            >
              <IoSparkles className="text-accent" /> Mahotsav
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden sm:inline text-white/50 tabular-nums">{time} GMT+5:45</span>
              <Link to="/explore" className="text-white/80 hover:text-white transition-colors">
                Discover Events
              </Link>
              <Link
                to={token ? '/dashboard' : '/auth/login'}
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-colors"
              >
                {token ? 'Dashboard' : 'Sign In'}
              </Link>
            </div>
          </div>
        </header>

        {/* Hero body */}
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[calc(100vh-4rem)] py-12">
            {/* Left copy */}
            <div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight">
                Delightful
                <br />
                events
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-500">
                  start{' '}
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-400">
                  here.
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/60 max-w-md leading-relaxed">
                Set up an event page, invite friends, and manage RSVPs. Host a memorable event
                today.
              </p>
              <Link
                to={token ? '/dashboard/create' : '/auth/signup'}
                className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 hover:bg-white/90 transition-all hover:-translate-y-0.5"
              >
                {token ? 'Create an Event' : 'Create Your First Event'}
                <IoArrowForward className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Right visual */}
            <div className="flex justify-center lg:justify-end">
              <PhoneHero />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 reveal-up" data-reveal>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 reveal-up" data-reveal>
        <div className="container">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to host</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20 md:py-24 reveal-up" data-reveal>
        <div className="container">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">From idea to event in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.number}
                className="rounded-2xl p-6 bg-white/[0.04] border border-white/10"
              >
                <span className="text-sm font-bold text-violet-400">{s.number}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 reveal-up" data-reveal>
        <div className="container">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.25),rgba(236,72,153,0.15))]">
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold">Delightful events start here.</h2>
              <p className="mt-4 text-white/60 max-w-lg mx-auto">
                Join organizers across Nepal already hosting with Mahotsav — free.
              </p>
              <Link
                to={token ? '/dashboard/create' : '/auth/signup'}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 hover:bg-white/90 transition-all hover:-translate-y-0.5"
              >
                {token ? 'Create an Event' : 'Create Your First Event'}
                <IoArrowForward />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 pt-14 pb-10">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-bold inline-flex items-center gap-1.5">
                <IoSparkles className="text-accent" /> Mahotsav
              </h3>
              <p className="mt-3 text-sm text-white/40 leading-relaxed">
                The modern event platform built for Nepal.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li>
                  <Link className="hover:text-white transition-colors" to="/explore">
                    Discover Events
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" to="/dashboard/create">
                    Create Event
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li>
                  <a className="hover:text-white transition-colors" href="#">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#">
                    Contact
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Connect
              </h4>
              <div className="flex gap-2">
                {[RiInstagramLine, RiTwitterLine, RiGithubFill].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 inline-flex items-center justify-center text-white/50 hover:text-white transition-all"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <hr className="my-8 border-white/5" />
          <p className="text-center text-xs text-white/30">
            © {new Date().getFullYear()} Mahotsav. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
