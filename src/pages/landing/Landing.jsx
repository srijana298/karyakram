import { useEffect } from "react";
import { Link } from "react-router-dom";
import HeroBg from "../../assets/images/herobg.jpg";
import {
  IoArrowForward,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoGlobeOutline,
  IoLinkOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoStar,
  IoTicketOutline,
} from "react-icons/io5";
import { RiGithubFill, RiInstagramLine, RiTwitterLine } from "react-icons/ri";

function Landing() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  let token = null;
  try {
    token = JSON.parse(localStorage.getItem("token"));
  } catch {
    token = null;
  }

  const features = [
    {
      icon: <IoCalendarOutline className="text-2xl" />,
      title: "Create Events",
      description:
        "Set up events in minutes with customizable forms, dates, locations, and cover images.",
      color: "bg-emerald-50 text-primary",
    },
    {
      icon: <IoTicketOutline className="text-2xl" />,
      title: "Manage RSVPs",
      description:
        "Track attendees and approve RSVP requests — all from one dashboard.",
      color: "bg-amber-50 text-accent",
    },
    {
      icon: <IoPeopleOutline className="text-2xl" />,
      title: "Go Live",
      description:
        "Host online or offline events, scan QR codes for attendance, and download event tickets.",
      color: "bg-stone-100 text-stone-700",
    },
    {
      icon: <IoShieldCheckmarkOutline className="text-2xl" />,
      title: "Secure & Reliable",
      description:
        "Your data is safe with us. Built with modern security practices and reliable infrastructure.",
      color: "bg-rose-50 text-rose-600",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Event",
      description:
        "Fill in the details, upload a cover image, and set your event preferences.",
      icon: <IoCalendarOutline className="text-xl" />,
    },
    {
      number: "02",
      title: "Share & RSVP",
      description:
        "Share event links and let students RSVP with one click.",
      icon: <IoLinkOutline className="text-xl" />,
    },
    {
      number: "03",
      title: "Manage & Celebrate",
      description:
        "Track RSVPs, mark attendance with QR codes, and focus on hosting a great event.",
      icon: <IoCheckmarkCircleOutline className="text-xl" />,
    },
  ];

  const stats = [
    { value: "500+", label: "Events Created", icon: <IoCalendarOutline className="text-lg" /> },
    { value: "10K+", label: "RSVPs Processed", icon: <IoTicketOutline className="text-lg" /> },
    { value: "200+", label: "College Organizers", icon: <IoPeopleOutline className="text-lg" /> },
    { value: "50+", label: "Campuses Reached", icon: <IoGlobeOutline className="text-lg" /> },
  ];

  return (
    <div className="flex-1 bg-white font-sans">
      {/* Hero — Full-width background image */}
      <section
        className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5,150,105,0.88), rgba(28,25,23,0.78)), url(${HeroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Ambient glow accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

        <div className="container relative z-10 text-center text-white py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-medium text-white/90">
            <IoSparklesOutline className="text-accent" />
            The all-in-one platform for campus events
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-[1.05] max-w-4xl mx-auto tracking-tight">
            Campus Events,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-accent">
              Simplified.
            </span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Create. Manage. Celebrate. — RSVP, ticketing, and event management built for college organizers.
          </p>
          <div className="mt-10 inline-flex flex-wrap justify-center gap-3">
            <Link
              to={token ? "/dashboard" : "/auth/signup"}
              className="group rounded-lg px-8 py-3 text-sm font-semibold bg-accent text-secondary hover:bg-amber-400 shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              {token ? "Go to Dashboard" : "Host Your Event"}
              <IoArrowForward className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/explore"
              className="rounded-lg px-8 py-3 text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              Explore Events
            </Link>
          </div>

          {/* Social proof row */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/80">
            <div className="flex items-center -space-x-2.5">
              {["bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-violet-400"].map(
                (c, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-full ${c} ring-2 ring-white/30`}
                  />
                )
              )}
            </div>
            <div className="text-sm">
              <span className="inline-flex items-center gap-1 text-accent">
                {[...Array(5)].map((_, i) => (
                  <IoStar key={i} className="text-xs" />
                ))}
              </span>
              <p className="text-white/70 text-xs mt-0.5">
                Trusted by <span className="font-semibold text-white">200+ organizers</span> across 50+ campuses
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <IoChevronDownOutline className="text-2xl text-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-6 bg-secondary reveal-up" data-reveal>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-accent mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl md:text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-xs text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — 2x2 grid with icon cards */}
      <section className="py-20 md:py-24 bg-white reveal-up" data-reveal>
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary">
              Everything You Need
            </h2>
            <p className="mt-3 text-sm text-stone-500">
              From planning to execution, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {features.map((item) => (
              <div
                key={item.title}
                className="group rounded-xl p-6 bg-stone-50/80 border border-stone-100 hover:bg-white hover:shadow-lg hover:shadow-stone-200/50 hover:border-stone-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-lg ${item.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-secondary">{item.title}</h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Horizontal timeline */}
      <section className="py-20 md:py-24 bg-stone-50 reveal-up" data-reveal>
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary">
              Three Simple Steps
            </h2>
            <p className="mt-3 text-sm text-stone-500">
              From idea to event in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary via-accent to-primary opacity-30" />

            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto shadow-lg shadow-primary/20">
                  {step.number}
                </div>
                <h3 className="mt-5 text-base font-bold text-secondary">{step.title}</h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Bold gradient */}
      <section className="py-20 md:py-24 bg-white reveal-up" data-reveal>
        <div className="container">
          <div className="relative bg-secondary rounded-2xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                Ready to Host Your Next Event?
              </h2>
              <p className="mt-3 text-sm md:text-base text-stone-400 max-w-lg mx-auto">
                Join hundreds of college organizers already using Mahotsav.
              </p>
              <div className="mt-8 inline-flex flex-wrap justify-center gap-3">
                <Link
                  to={token ? "/dashboard" : "/auth/signup"}
                  className="rounded-lg px-6 py-3 text-sm font-semibold bg-primary text-white hover:bg-emerald-600 inline-flex items-center gap-2 shadow-lg shadow-primary/30"
                >
                  Get Started Free
                  <IoArrowForward className="text-sm" />
                </Link>
                <Link
                  to="/explore"
                  className="rounded-lg px-6 py-3 text-sm font-semibold border border-white/20 text-white hover:bg-white/10"
                >
                  See How It Works
                </Link>
              </div>
              <p className="mt-6 text-xs text-stone-500">
                No credit card required. Free for college events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — Clean with warm tones */}
      <footer className="bg-stone-900 text-white pt-16 pb-10 reveal-up" data-reveal>
        <div className="container">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-extrabold text-white">Mahotsav</h3>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">
                The modern event management platform built for college organizers.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li><Link className="hover:text-white transition-colors" to="/explore">Explore Events</Link></li>
                <li><Link className="hover:text-white transition-colors" to="/dashboard">Dashboard</Link></li>
                <li><Link className="hover:text-white transition-colors" to="/dashboard/create">Create Event</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li><a className="hover:text-white transition-colors" href="#">About</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Contact</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Connect</h4>
              <div className="flex gap-2">
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 inline-flex items-center justify-center text-stone-400 hover:text-white transition-all">
                  <RiInstagramLine />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 inline-flex items-center justify-center text-stone-400 hover:text-white transition-all">
                  <RiTwitterLine />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 inline-flex items-center justify-center text-stone-400 hover:text-white transition-all">
                  <RiGithubFill />
                </a>
              </div>
            </div>
          </div>
          <hr className="my-8 border-stone-800" />
          <p className="text-center text-xs text-stone-600">
            © {new Date().getFullYear()} Mahotsav. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
