import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useListExperiences,
  getListExperiencesQueryKey,
  useGetExperienceStats,
} from "@workspace/api-client-react";
import { Navbar } from "../components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Star,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/* ─── Constants ─── */
const BRAND_NAVY = "#0B2F5E";
const BRAND_YELLOW = "#F4C542";

const CATEGORIES = [
  { label: "Tour a piedi", count: 14 },
  { label: "Musei", count: 9 },
  { label: "Cibo", count: 7 },
  { label: "Avventura", count: 5 },
  { label: "Arte & Cultura", count: 11 },
];

const DURATIONS = [
  { label: "Fino a 1 ora", value: "short" },
  { label: "1 – 2 ore", value: "short" },
  { label: "2 – 4 ore", value: "medium" },
  { label: "Mezza giornata", value: "medium" },
  { label: "Giornata intera", value: "long" },
];

const DURATION_FILTER = [
  { label: "Fino a 2 ore", value: "short" },
  { label: "2 – 4 ore", value: "medium" },
  { label: "Oltre 4 ore", value: "long" },
];

const LANGUAGES = ["Italiano", "Inglese", "Spagnolo", "Francese", "Tedesco"];

const SORT_OPTIONS = [
  { label: "Più popolari", value: "popular" },
  { label: "Prezzo: dal più basso", value: "price_asc" },
  { label: "Prezzo: dal più alto", value: "price_desc" },
  { label: "Valutazione", value: "rating" },
];

/* ─── Sub-components ─── */
function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            cls,
            s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <span
        onClick={onChange}
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
          checked ? "border-[#0B2F5E] bg-[#0B2F5E]" : "border-gray-300 group-hover:border-[#0B2F5E]"
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        onClick={onChange}
        className={cn(
          "text-sm flex-1 transition-colors",
          checked ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

/* ─── Main component ─── */
export default function Home() {
  const [search, setSearch] = useState("Roma");
  const debouncedSearch = useDebounce(search, 500);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([300]);
  const [duration, setDuration] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all");
  const [languages, setLanguages] = useState<string[]>([]);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [topSeller, setTopSeller] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (categories.length === 1) params.category = categories[0];
    if (priceRange[0] < 300) params.maxPrice = priceRange[0];
    if (duration !== "all") params.duration = duration;
    if (minRating !== "all") params.minRating = Number(minRating);
    return params;
  }, [debouncedSearch, categories, priceRange, duration, minRating]);

  const { data: rawExperiences, isLoading } = useListExperiences(queryParams, {
    query: { queryKey: getListExperiencesQueryKey(queryParams) },
  });

  const { data: stats } = useGetExperienceStats();

  const experiences = useMemo(() => {
    if (!rawExperiences) return [];
    let list = [...rawExperiences];
    if (topSeller) list = list.filter((e) => Number(e.reviewCount) > 50);
    switch (sortBy) {
      case "price_asc": return list.sort((a, b) => Number(a.price) - Number(b.price));
      case "price_desc": return list.sort((a, b) => Number(b.price) - Number(a.price));
      case "rating": return list.sort((a, b) => Number(b.rating) - Number(a.rating));
      default: return list.sort((a, b) => Number(b.reviewCount) - Number(a.reviewCount));
    }
  }, [rawExperiences, sortBy, topSeller]);

  const activeFilterCount =
    categories.length +
    (priceRange[0] < 300 ? 1 : 0) +
    (duration !== "all" ? 1 : 0) +
    (minRating !== "all" ? 1 : 0) +
    languages.length +
    (freeCancellation ? 1 : 0) +
    (topSeller ? 1 : 0);

  const resetFilters = () => {
    setCategories([]);
    setPriceRange([300]);
    setDuration("all");
    setMinRating("all");
    setLanguages([]);
    setFreeCancellation(false);
    setTopSeller(false);
  };

  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleLanguage = (lang: string) =>
    setLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);

  const FilterSidebar = () => (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: BRAND_NAVY }} />
          <span className="font-semibold text-sm" style={{ color: BRAND_NAVY }}>Filtra per</span>
          {activeFilterCount > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: BRAND_NAVY }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Azzera
          </button>
        )}
      </div>

      {/* Quick toggles */}
      <div className="py-4 border-b border-border space-y-2">
        <button
          onClick={() => setTopSeller(!topSeller)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
            topSeller
              ? "text-white border-transparent"
              : "border-border text-muted-foreground hover:border-gray-400"
          )}
          style={topSeller ? { backgroundColor: BRAND_NAVY, borderColor: BRAND_NAVY } : {}}
        >
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          Top Seller
        </button>
        <button
          onClick={() => setFreeCancellation(!freeCancellation)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
            freeCancellation
              ? "text-white border-transparent"
              : "border-border text-muted-foreground hover:border-gray-400"
          )}
          style={freeCancellation ? { backgroundColor: BRAND_NAVY, borderColor: BRAND_NAVY } : {}}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Cancellazione gratuita
        </button>
      </div>

      {/* Category */}
      <FilterSection title="Categoria">
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <CheckRow
              key={c.label}
              label={c.label}
              count={c.count}
              checked={categories.includes(c.label)}
              onChange={() => toggleCategory(c.label)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Fascia di prezzo">
        <div className="space-y-3 pt-1">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={300}
            min={10}
            step={10}
            className="py-1"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-1 bg-muted rounded font-medium text-foreground">€10</span>
            <span className="text-xs font-bold" style={{ color: BRAND_NAVY }}>
              fino a €{priceRange[0]}
            </span>
            <span className="text-xs px-2 py-1 bg-muted rounded font-medium text-foreground">€300</span>
          </div>
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Durata">
        <div className="space-y-0.5">
          {DURATIONS.map((d) => (
            <CheckRow
              key={d.value + d.label}
              label={d.label}
              checked={duration === d.value && DURATION_FILTER.find(f => f.label === d.label) !== undefined}
              onChange={() => {
                const mapped = DURATION_FILTER.find(f => f.label === d.label || d.label.includes(f.label.split(" ")[0]));
                const val = mapped ? mapped.value : d.value;
                setDuration(duration === val ? "all" : val);
              }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Valutazione minima">
        <div className="space-y-1 pt-1">
          {[5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === String(r) ? "all" : String(r))}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-sm transition-all",
                minRating === String(r)
                  ? "border-transparent text-white"
                  : "border-border bg-transparent hover:border-gray-400"
              )}
              style={minRating === String(r) ? { backgroundColor: BRAND_NAVY } : {}}
            >
              <StarDisplay rating={r} size="xs" />
              <span className={cn("text-xs", minRating === String(r) ? "text-white" : "text-muted-foreground")}>
                {r === 5 ? "Solo 5 stelle" : `${r}+ stelle`}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title="Lingua" defaultOpen={false}>
        <div className="space-y-0.5">
          {LANGUAGES.map((lang) => (
            <CheckRow
              key={lang}
              label={lang}
              checked={languages.includes(lang)}
              onChange={() => toggleLanguage(lang)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Tipo */}
      <FilterSection title="Tipo di esperienza" defaultOpen={false}>
        <div className="space-y-0.5">
          {["Tour guidato", "Attività", "Transfer", "Spettacolo", "Degustazione"].map((t) => (
            <CheckRow key={t} label={t} checked={false} onChange={() => {}} />
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: "#F5F6F8" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative py-14 lg:py-20"
        style={{ backgroundColor: BRAND_NAVY }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2896&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 mx-auto px-4 max-w-screen-xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span>Italia</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">Roma</span>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-3 leading-tight">
              Attività e tour a Roma
            </h1>
            <p className="text-white/75 text-base mb-6 leading-relaxed">
              Scopri il meglio di Roma con le nostre esperienze curate da guide locali.
              {stats && (
                <span className="ml-1 font-semibold text-white/90">
                  {stats.totalExperiences} attività disponibili.
                </span>
              )}
            </p>
            {/* Search */}
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-lg max-w-xl">
              <div className="flex items-center gap-2 px-4 border-r border-gray-200">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Roma</span>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-0 bg-transparent focus-visible:ring-0 text-sm h-12 text-foreground"
                  placeholder="Cerca tour, monumenti, esperienze…"
                />
              </div>
              <button
                className="px-4 h-12 text-sm font-bold text-gray-800 mr-1 rounded-lg transition-colors hover:bg-gray-50"
                style={{ color: BRAND_NAVY }}
              >
                Cerca
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-6 max-w-screen-xl">

        {/* Mobile filter bar */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? "Caricamento…" : `${experiences.length} risultati`}
          </p>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-gray-400 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtri
            {activeFilterCount > 0 && (
              <span
                className="text-xs font-bold text-white rounded-full px-1.5 py-0.5 leading-none"
                style={{ backgroundColor: BRAND_NAVY }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filters accordion */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-5 bg-card border border-border rounded-xl p-5 shadow-sm">
            <FilterSidebar />
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* ── Results ── */}
          <main className="flex-1 min-w-0">
            {/* Sort / results bar */}
            <div className="flex items-center justify-between mb-5 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? "Caricamento…" : (
                    <>
                      <span style={{ color: BRAND_NAVY }}>{experiences.length}</span>
                      {" "}esperienz{experiences.length === 1 ? "a" : "e"} trovate
                    </>
                  )}
                </span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({activeFilterCount} filtri attivi)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">Ordina per:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-xs w-44 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND_NAVY }}
                  >
                    {c}
                    <button onClick={() => toggleCategory(c)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {priceRange[0] < 300 && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND_NAVY }}
                  >
                    fino a €{priceRange[0]}
                    <button onClick={() => setPriceRange([300])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {duration !== "all" && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND_NAVY }}
                  >
                    {DURATION_FILTER.find((d) => d.value === duration)?.label}
                    <button onClick={() => setDuration("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {topSeller && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND_NAVY }}
                  >
                    Top Seller <button onClick={() => setTopSeller(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {freeCancellation && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND_NAVY }}
                  >
                    Cancellazione gratuita <button onClick={() => setFreeCancellation(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                >
                  Azzera tutto
                </button>
              </div>
            )}

            {/* Cards grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-4/5" />
                      <div className="h-3 bg-muted rounded w-3/5" />
                      <div className="h-3 bg-muted rounded w-2/5" />
                      <div className="h-9 bg-muted rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Nessuna esperienza trovata
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prova a modificare i filtri o il termine di ricerca
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Rimuovi tutti i filtri
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {experiences.map((exp, idx) => (
                  <article
                    key={exp.id}
                    className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={exp.imageUrl}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      {/* Category badge */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                          {exp.category}
                        </span>
                        {idx < 2 && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                            style={{ backgroundColor: BRAND_YELLOW, color: "#1a1a1a" }}
                          >
                            Top Seller
                          </span>
                        )}
                      </div>
                      {/* Price badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                        <span className="font-bold text-sm" style={{ color: BRAND_NAVY }}>
                          Da €{exp.price}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Rating row */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <StarDisplay rating={Number(exp.rating)} />
                        <span className="text-xs font-bold text-foreground">{exp.rating}</span>
                        <span className="text-xs text-muted-foreground">({exp.reviewCount} recensioni)</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {exp.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed mb-3">
                        {exp.shortDescription}
                      </p>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {Math.floor(exp.durationMinutes / 60)}h
                          {exp.durationMinutes % 60 > 0 ? ` ${exp.durationMinutes % 60}m` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Cancellazione gratuita
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3" />
                          Gruppo piccolo
                        </span>
                      </div>

                      {/* CTA */}
                      <Link href={`/experience/${exp.id}`}>
                        <button
                          className="w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all hover:brightness-105 active:scale-[0.98]"
                          style={{ backgroundColor: BRAND_YELLOW, color: "#1a1a1a" }}
                        >
                          Prenota ora
                        </button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
