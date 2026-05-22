import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetExperience, 
  getGetExperienceQueryKey,
  useCreateBooking,
  useAddFavorite,
  useRemoveFavorite,
  useListFavorites,
  getListFavoritesQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Clock, MapPin, Heart, Users, CalendarIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const experienceId = Number(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<string>("");
  const [participants, setParticipants] = useState<number>(1);

  const { data: experience, isLoading } = useGetExperience(experienceId, {
    query: { enabled: !!experienceId, queryKey: getGetExperienceQueryKey(experienceId) }
  });

  const { data: favorites } = useListFavorites({
    query: { enabled: !!user, queryKey: getListFavoritesQueryKey() }
  });

  const isFavorite = useMemo(() => {
    return favorites?.some((f) => f.experienceId === experienceId) ?? false;
  }, [favorites, experienceId]);

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const createBooking = useCreateBooking();

  const handleToggleFavorite = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (isFavorite) {
      removeFavorite.mutate(experienceId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
          toast({ title: "Rimosso dai preferiti" });
        }
      });
    } else {
      addFavorite.mutate({ data: { experienceId } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
          toast({ title: "Aggiunto ai preferiti" });
        }
      });
    }
  };

  const handleBook = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (!date) {
      toast({ title: "Seleziona una data", variant: "destructive" });
      return;
    }
    
    createBooking.mutate({ data: { experienceId, bookedDate: new Date(date).toISOString(), participants } }, {
      onSuccess: () => {
        toast({ title: "Prenotazione confermata!", description: "Ti aspettiamo a Roma." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({ title: "Errore durante la prenotazione", description: error.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div className="min-h-[100dvh] flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center">Caricamento...</div></div>;
  if (!experience) return <div className="min-h-[100dvh] flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center">Esperienza non trovata</div></div>;

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[500px]">
              <img src={experience.imageUrl} alt={experience.title} className="w-full h-full object-cover" />
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm"
                onClick={handleToggleFavorite}
                disabled={addFavorite.isPending || removeFavorite.isPending}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-primary text-primary' : 'text-foreground'}`} />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-sm font-medium text-amber-600 mb-3">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{experience.rating}</span>
                  <span className="text-muted-foreground font-normal">({experience.reviewCount} recensioni)</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                  {experience.title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                  {experience.shortDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 py-6 border-y border-border/50">
                <div className="flex items-center text-foreground">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">{Math.floor(experience.durationMinutes / 60)}h {experience.durationMinutes % 60 > 0 ? `${experience.durationMinutes % 60}m` : ''}</span>
                </div>
                <div className="flex items-center text-foreground">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">Punto di incontro a Roma</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">Gruppo piccolo</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold">L'esperienza</h2>
                <div className="prose prose-lg dark:prose-invert text-muted-foreground max-w-none">
                  {experience.longDescription.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">€{experience.price}</span>
                    <span className="text-muted-foreground"> / persona</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Scegli una data</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="date" 
                          type="date" 
                          min={today}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="pl-10" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="participants">Partecipanti</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="participants" 
                          type="number" 
                          min={1} 
                          max={10} 
                          value={participants}
                          onChange={(e) => setParticipants(parseInt(e.target.value))}
                          className="pl-10" 
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 text-lg font-medium mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleBook}
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? "Prenotazione..." : "Prenota ora"}
                    </Button>
                    
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Non ti verrà addebitato alcun importo in questa fase.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-secondary/10 rounded-xl flex gap-3">
                <div className="bg-secondary/20 p-2 rounded-full h-fit">
                  <Check className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Cancellazione gratuita</h4>
                  <p className="text-xs text-muted-foreground mt-1">Cancella fino a 24 ore prima dell'inizio per un rimborso completo.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
