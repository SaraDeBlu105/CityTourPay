import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListExperiences, getListExperiencesQueryKey, useGetExperienceStats, ListExperiencesDuration } from "@workspace/api-client-react";
import { Navbar } from "../components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

export default function Home() {
  const [search, setSearch] = useState("Roma");
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([300]);
  const [duration, setDuration] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all");

  const queryParams = useMemo(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== "all") params.category = category;
    if (priceRange[0] < 300) params.maxPrice = priceRange[0];
    if (duration !== "all") params.duration = duration;
    if (minRating !== "all") params.minRating = Number(minRating);
    return params;
  }, [debouncedSearch, category, priceRange, duration, minRating]);

  const { data: experiences, isLoading } = useListExperiences(queryParams, {
    query: { queryKey: getListExperiencesQueryKey(queryParams) }
  });

  const { data: stats } = useGetExperienceStats();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2896&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white leading-tight">
            Scopri l'Anima di Roma
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground/90 mb-10 font-medium">
            Esperienze curate, guide locali, ricordi indimenticabili. 
            {stats && ` Più di ${stats.totalExperiences} attività disponibili.`}
          </p>
          <div className="relative max-w-2xl mx-auto flex items-center bg-background rounded-full p-2 shadow-xl">
            <Search className="absolute left-6 w-5 h-5 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 rounded-full border-0 bg-transparent text-lg focus-visible:ring-0 text-foreground h-12"
              placeholder="Cerca attività, monumenti, tour..."
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div className="bg-card p-6 rounded-xl border shadow-sm sticky top-24">
            <h3 className="font-serif text-xl font-bold mb-6 text-primary">Filtri</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tutte le categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    <SelectItem value="Tour a piedi">Tour a piedi</SelectItem>
                    <SelectItem value="Musei">Musei</SelectItem>
                    <SelectItem value="Cibo">Cibo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex justify-between">
                  <span>Prezzo massimo</span>
                  <span>€{priceRange[0]}</span>
                </Label>
                <Slider 
                  value={priceRange} 
                  onValueChange={setPriceRange} 
                  max={300} 
                  step={10} 
                  className="py-2"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Durata</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Qualsiasi durata" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualsiasi durata</SelectItem>
                    <SelectItem value="short">Fino a 2 ore</SelectItem>
                    <SelectItem value="medium">2 - 4 ore</SelectItem>
                    <SelectItem value="long">Oltre 4 ore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Valutazione minima</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Qualsiasi valutazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualsiasi valutazione</SelectItem>
                    <SelectItem value="4.5">4.5+ Stelle</SelectItem>
                    <SelectItem value="4">4.0+ Stelle</SelectItem>
                    <SelectItem value="3">3.0+ Stelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Experience Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-xl h-[400px]"></div>
              ))}
            </div>
          ) : experiences?.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-xl border border-dashed">
              <h3 className="text-xl font-serif text-muted-foreground mb-2">Nessuna esperienza trovata</h3>
              <p className="text-sm text-muted-foreground">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {experiences?.map((exp) => (
                <Link key={exp.id} href={`/experience/${exp.id}`}>
                  <Card className="group overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border-border/50 h-full flex flex-col">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={exp.imageUrl} 
                        alt={exp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <Badge className="absolute top-4 left-4 bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                        {exp.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center text-sm font-medium text-amber-600">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          <span>{exp.rating}</span>
                          <span className="text-muted-foreground ml-1 font-normal">({exp.reviewCount})</span>
                        </div>
                      </div>
                      <h3 className="font-serif text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {exp.shortDescription}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {Math.floor(exp.durationMinutes / 60)}h {exp.durationMinutes % 60 > 0 ? `${exp.durationMinutes % 60}m` : ''}
                        </div>
                        <div className="font-bold text-lg text-foreground">
                          €{exp.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
