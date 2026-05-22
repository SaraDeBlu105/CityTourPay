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
import { MapPin, Clock, Star, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tour a piedi", "Musei", "Cibo"];
const DURATIONS = [
  { label: "Fino a 2h", value: "short" },
  { label: "2 – 4h", value: "medium" },
  { label: "Oltre 4h", value: "long" },
];
const RATINGS = [
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4" },
  { label: "3.0+", value: "3" },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-3.5 h-3.5",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("Roma");
  const debouncedSearch = useDebounce(search, 500);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([300]);
  const [duration, setDuration] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (categories.length === 1) params.category = categories[0];
    if (priceRange[0] < 300) params.maxPrice = priceRange[0];
    if (duration !== "all") params.duration = duration;
    if (minRating !== "all") params.minRating = Number(minRating);
    return params;
  }, [debouncedSearch, categories, priceRange, duration, minRating]);

  const { data: experiences, isLoading } = useListExperiences(queryParams, {
    query: { queryKey: getListExperiencesQueryKey(queryParams) },
  });

  const { data: stats } = useGetExperienceStats();

  const activeFilterCount =
    categories.length +
    (priceRange[0] < 300 ? 1 : 0) +
    (duration !== "all" ? 1 : 0) +
    (minRating !== "all" ? 1 : 0);

  const resetFilters = () => {
    setCategories([]);
    setPriceRange([300]);
    setDuration("all");
    setMinRating("all");
  };

  const toggleCategory = (cat: string) =>
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-primary">Filtri</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Azzera
          </button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Categoria</p>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const active = categories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                    active
                      ? "bg-primary border-primary"
                      : "border-border group-hover:border-primary/60"
                  )}
                  onClick={() => toggleCategory(cat)}
                >
                  {active && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    active ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Price */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Prezzo max</p>
          <span className="text-sm font-bold text-primary">€{priceRange[0]}</span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={300}
          min={10}
          step={10}
          className="py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€10</span>
          <span>€300</span>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Duration */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Durata</p>
        <div className="flex flex-col gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(duration === d.value ? "all" : d.value)}
              className={cn(
                "text-sm px-3 py-2 rounded-lg border text-left transition-all",
                duration === d.value
                  ? "bg-primary text-primary-foreground border-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Rating */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Valutazione</p>
        <div className="flex flex-col gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => setMinRating(minRating === r.value ? "all" : r.value)}
              className={cn(
                "flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all",
                minRating === r.value
                  ? "bg-primary text-primary-foreground border-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <Star
                className={cn(
                  "w-3.5 h-3.5 fill-current",
                  minRating === r.value ? "text-white" : "text-amber-400"
                )}
              />
              {r.label} stelle
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative w-full py-20 lg:py-28 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2896&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 text-white/70 text-sm mb-4 font-medium">
            <MapPin className="w-4 h-4" />
            Roma, Italia
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-5 text-white leading-tight">
            Scopri l'Anima di Roma
          </h1>
          <p className="text-lg text-white/80 mb-8 font-medium">
            Esperienze curate, guide locali, ricordi indimenticabili.
            {stats && (
              <span className="ml-1 text-white/60">
                Più di {stats.totalExperiences} attività.
              </span>
            )}
          </p>
          <div className="relative max-w-xl mx-auto flex items-center bg-white rounded-xl shadow-2xl overflow-hidden">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 border-0 bg-transparent text-base focus-visible:ring-0 text-foreground h-14"
              placeholder="Cerca tour, esperienze, monumenti..."
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Caricamento…" : `${experiences?.length ?? 0} esperienze`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtri
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
            {sidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="lg:hidden mb-6 bg-card border rounded-xl p-5 shadow-sm">
            <FilterPanel />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card border rounded-xl p-5 shadow-sm sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <FilterPanel />
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Caricamento esperienze…"
                  : `${experiences?.length ?? 0} esperienz${experiences?.length === 1 ? "a" : "e"} trovate`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl overflow-hidden border bg-card">
                    <div className="bg-muted aspect-video" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-muted-foreground mb-1">Nessuna esperienza trovata</h3>
                <p className="text-sm text-muted-foreground">Prova a modificare i filtri di ricerca</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                    Rimuovi filtri
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {experiences?.map((exp) => (
                  <article
                    key={exp.id}
                    className="group bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Image 16:9 */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={exp.imageUrl}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground text-xs backdrop-blur-sm border-0 shadow-sm font-medium">
                        {exp.category}
                      </Badge>
                      <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                        <span className="font-bold text-sm text-foreground">€{exp.price}</span>
                        <span className="text-xs text-muted-foreground"> /pers.</span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="font-serif font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {exp.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                        {exp.shortDescription}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <StarDisplay rating={Number(exp.rating)} />
                          <span className="text-xs font-semibold text-foreground">{exp.rating}</span>
                          <span className="text-xs text-muted-foreground">({exp.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(exp.durationMinutes / 60)}h
                          {exp.durationMinutes % 60 > 0 ? ` ${exp.durationMinutes % 60}m` : ""}
                        </div>
                      </div>

                      {/* CTA */}
                      <Link href={`/experience/${exp.id}`} className="mt-2">
                        <Button
                          className="w-full font-medium"
                          size="sm"
                        >
                          Scopri i dettagli
                        </Button>
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
