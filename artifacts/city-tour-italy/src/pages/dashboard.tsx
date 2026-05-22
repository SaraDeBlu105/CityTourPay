import { useState } from "react";
import { Link } from "wouter";
import { 
  useListMyBookings, 
  getListMyBookingsQueryKey,
  useListFavorites,
  getListFavoritesQueryKey,
  useRemoveFavorite,
  useUpdateProfile,
  getGetMeQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Users, MapPin, Trash2, Heart } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || "");

  const { data: bookings, isLoading: loadingBookings } = useListMyBookings({
    query: { queryKey: getListMyBookingsQueryKey() }
  });

  const { data: favorites, isLoading: loadingFavorites } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() }
  });

  const removeFavorite = useRemoveFavorite();
  const updateProfile = useUpdateProfile();

  const handleRemoveFavorite = (experienceId: number) => {
    removeFavorite.mutate(experienceId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        toast({ title: "Rimosso dai preferiti" });
      }
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ data: { name } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profilo aggiornato con successo" });
      },
      onError: (error: any) => {
        toast({ title: "Errore durante l'aggiornamento", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl flex-1">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Ciao, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestisci le tue prenotazioni e il tuo profilo
          </p>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
            <TabsTrigger value="favorites">Preferiti</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="space-y-6">
            {loadingBookings ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>)}
              </div>
            ) : bookings?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-serif font-medium mb-2">Nessuna prenotazione</h3>
                  <p className="text-muted-foreground mb-6">Non hai ancora prenotato nessuna esperienza.</p>
                  <Button asChild>
                    <Link href="/">Esplora le esperienze</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings?.map(booking => (
                  <Card key={booking.id} className="overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img 
                        src={booking.experience?.imageUrl} 
                        alt={booking.experience?.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/experience/${booking.experience?.id}`} className="hover:underline">
                            <h3 className="text-xl font-serif font-bold text-foreground">
                              {booking.experience?.title}
                            </h3>
                          </Link>
                          <span className="font-bold text-lg bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                            Confermata
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {booking.experience?.shortDescription}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <div className="flex items-center text-foreground">
                          <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                          {format(new Date(booking.bookedDate), "dd MMMM yyyy", { locale: it })}
                        </div>
                        <div className="flex items-center text-foreground">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          {booking.participants} {booking.participants === 1 ? 'persona' : 'persone'}
                        </div>
                        <div className="flex items-center text-foreground">
                          <MapPin className="w-4 h-4 mr-2 text-primary" />
                          Roma, Italia
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-6">
            {loadingFavorites ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>)}
              </div>
            ) : favorites?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-serif font-medium mb-2">Nessun preferito</h3>
                  <p className="text-muted-foreground mb-6">Non hai ancora salvato nessuna esperienza tra i preferiti.</p>
                  <Button asChild>
                    <Link href="/">Esplora le esperienze</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites?.map(fav => (
                  <Card key={fav.id} className="overflow-hidden flex flex-col">
                    <div className="relative h-48">
                      <img 
                        src={fav.experience?.imageUrl} 
                        alt={fav.experience?.title} 
                        className="w-full h-full object-cover"
                      />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(fav.experienceId);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <Link href={`/experience/${fav.experience?.id}`} className="hover:underline flex-1">
                        <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                          {fav.experience?.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {fav.experience?.shortDescription}
                        </p>
                      </Link>
                      <div className="mt-4 pt-4 border-t font-bold text-lg">
                        €{fav.experience?.price}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profile">
            <Card className="max-w-xl">
              <CardContent className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">L'indirizzo email non può essere modificato.</p>
                    </div>
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Salvataggio..." : "Salva modifiche"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
