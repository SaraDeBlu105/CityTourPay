import { Link } from "wouter";
import { useGetExperienceStats } from "@workspace/api-client-react";
import { Navbar } from "../components/layout/Navbar";
import { MapPin, Star, ArrowRight, Clock, Shield, Headphones, Award } from "lucide-react";

const BRAND_NAVY = "#0B2F5E";
const BRAND_YELLOW = "#F4C542";

const DESTINATIONS = [
  {
    name: "Roma",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    href: "/roma",
    live: true,
  },
  {
    name: "Firenze",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1541370976299-4d24be63e18f?q=80&w=800&auto=format&fit=crop",
    href: null,
    live: false,
    tours: "38 tour",
  },
  {
    name: "Venezia",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800&auto=format&fit=crop",
    href: null,
    live: false,
    tours: "29 tour",
  },
  {
    name: "Milano",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=800&auto=format&fit=crop",
    href: null,
    live: false,
    tours: "21 tour",
  },
  {
    name: "Napoli",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800&auto=format&fit=crop",
    href: null,
    live: false,
    tours: "17 tour",
  },
  {
    name: "Amalfi",
    country: "Italia",
    image: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?q=80&w=800&auto=format&fit=crop",
    href: null,
    live: false,
    tours: "12 tour",
  },
];

const WHY_US = [
  {
    icon: Shield,
    title: "Prenotazione sicura",
    desc: "Pagamento protetto e cancellazione gratuita su tutti i tour selezionati.",
  },
  {
    icon: Star,
    title: "Guide certificate",
    desc: "Solo guide locali certificate con anni di esperienza sul campo.",
  },
  {
    icon: Headphones,
    title: "Assistenza 24/7",
    desc: "Supporto in italiano sempre disponibile prima, durante e dopo il tour.",
  },
  {
    icon: Award,
    title: "Miglior prezzo",
    desc: "Garanzia miglior prezzo: ti rimborsiamo la differenza se trovi di meno.",
  },
];

const CATEGORIES = [
  { label: "Tour a piedi", icon: "🚶", count: 14 },
  { label: "Musei & Siti", icon: "🏛️", count: 9 },
  { label: "Food & Wine", icon: "🍷", count: 7 },
  { label: "Arte & Cultura", icon: "🎨", count: 11 },
  { label: "Avventura", icon: "🧗", count: 5 },
  { label: "Tour in barca", icon: "⛵", count: 4 },
];

export default function Homepage() {
  const { data: stats } = useGetExperienceStats();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: BRAND_NAVY }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=2560&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 max-w-screen-xl py-20 lg:py-28">
          <div className="max-w-2xl">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ backgroundColor: BRAND_YELLOW, color: BRAND_NAVY }}
            >
              Il tuo portale di esperienze italiane
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-5">
              Scopri le migliori<br />
              <span style={{ color: BRAND_YELLOW }}>esperienze</span> in Italia
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed max-w-lg">
              Tour guidati, esperienze locali e attività culturali curate da guide certificate.
              Prenota in pochi click, cancella gratis.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { value: `${stats?.totalExperiences ?? "50"}+`, label: "Esperienze" },
                { value: "4.8★", label: "Valutazione media" },
                { value: "12k+", label: "Clienti soddisfatti" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/60 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <Link href="/roma">
              <button
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: BRAND_YELLOW, color: BRAND_NAVY }}
              >
                Esplora Roma
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative z-10 -mb-px">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-2xl font-serif font-bold" style={{ color: BRAND_NAVY }}>
                Cosa vuoi fare?
              </h2>
              <p className="text-sm text-gray-500 mt-1">Scegli una categoria e trova l'esperienza perfetta</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} href="/roma">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all text-center group">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-800 leading-tight">
                    {cat.label}
                  </span>
                  <span className="text-xs text-gray-400">{cat.count} tour</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-2xl font-serif font-bold" style={{ color: BRAND_NAVY }}>
                Destinazioni popolari
              </h2>
              <p className="text-sm text-gray-500 mt-1">Le città italiane più amate dai viaggiatori</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((dest) => {
              const cardInner = (
                <div className="group relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all cursor-pointer h-48 flex flex-col">
                  {/* Image */}
                  <div className="relative flex-1 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {dest.live && (
                      <span
                        className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: BRAND_YELLOW, color: BRAND_NAVY }}
                      >
                        Disponibile
                      </span>
                    )}
                    {!dest.live && (
                      <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 text-white/80">
                        Prossimamente
                      </span>
                    )}
                  </div>
                  {/* Bottom */}
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm" style={{ color: BRAND_NAVY }}>{dest.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{dest.country}</span>
                        </div>
                      </div>
                      {dest.live ? (
                        <div
                          className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ backgroundColor: BRAND_NAVY, color: "white" }}
                        >
                          {stats?.totalExperiences ?? "6"} tour
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-medium">{dest.tours}</div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return dest.live ? (
                <Link key={dest.name} href={dest.href!}>
                  {cardInner}
                </Link>
              ) : (
                <div key={dest.name} className="opacity-75 cursor-not-allowed">
                  {cardInner}
                </div>
              );
            })}
          </div>

          {/* Roma featured CTA */}
          <div
            className="mt-6 rounded-2xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${BRAND_NAVY} 0%, #1a4a8a 100%)` }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1400&auto=format&fit=crop")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wide">
                  Destinazione in evidenza
                </p>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                  Roma, l'Eterna Città
                </h3>
                <p className="text-white/75 text-sm max-w-md leading-relaxed">
                  Colosseo, Vaticano, Fontana di Trevi e tanto altro.
                  Scopri Roma con le nostre guide locali certificate.
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Tour da 1h a tutto il giorno
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
                    4.8 valutazione media
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    Cancellazione gratuita
                  </div>
                </div>
              </div>
              <Link href="/roma" className="flex-shrink-0">
                <button
                  className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap"
                  style={{ backgroundColor: BRAND_YELLOW, color: BRAND_NAVY }}
                >
                  Vedi tutti i tour →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif font-bold mb-2" style={{ color: BRAND_NAVY }}>
              Perché scegliere City Tour Italy
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Migliaia di viaggiatori ci scelgono ogni anno per le loro vacanze in Italia
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: BRAND_NAVY }}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-sm mb-2" style={{ color: BRAND_NAVY }}>
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-14" style={{ backgroundColor: BRAND_NAVY }}>
        <div className="container mx-auto px-4 max-w-screen-xl text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-3">
            Pronto a scoprire Roma?
          </h2>
          <p className="text-white/70 mb-7 max-w-md mx-auto text-sm">
            Oltre {stats?.totalExperiences ?? "6"} esperienze disponibili subito.
            Prenota oggi, cancella gratis entro 24 ore.
          </p>
          <Link href="/roma">
            <button
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: BRAND_YELLOW, color: BRAND_NAVY }}
            >
              Esplora le esperienze
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-lg" style={{ color: BRAND_YELLOW }}>
                City Tour Italy
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Le migliori esperienze turistiche in Italia
              </p>
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <Link href="/roma" className="hover:text-white transition-colors">Roma</Link>
              <Link href="/login" className="hover:text-white transition-colors">Accedi</Link>
              <Link href="/register" className="hover:text-white transition-colors">Registrati</Link>
            </div>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} City Tour Italy. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
