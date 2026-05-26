import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetExperience,
  getGetExperienceQueryKey,
  useCreateBooking,
  useAddFavorite,
  useRemoveFavorite,
  useListFavorites,
  getListFavoritesQueryKey,
  useListExperienceReviews,
  getListExperienceReviewsQueryKey,
  useCreateReview,
  validateCoupon,
} from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { PhotoGallery } from "../components/PhotoGallery";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Clock, MapPin, Heart, Users, CalendarIcon, Check, Tag, MessageSquare, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const experienceId = Number(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<string>("");
  const [participants, setParticipants] = useState<number>(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: experience, isLoading } = useGetExperience(experienceId, {
    query: { enabled: !!experienceId, queryKey: getGetExperienceQueryKey(experienceId) },
  });

  const { data: favorites } = useListFavorites({
    query: { enabled: !!user, queryKey: getListFavoritesQueryKey() },
  });

  const { data: reviews, isLoading: loadingReviews } = useListExperienceReviews(experienceId, {
    query: { enabled: !!experienceId, queryKey: getListExperienceReviewsQueryKey(experienceId) },
  });

  const isFavorite = useMemo(
    () => favorites?.some((f) => f.experienceId === experienceId) ?? false,
    [favorites, experienceId],
  );

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const createBooking = useCreateBooking();
  const createReview = useCreateReview();

  const handleToggleFavorite = () => {
    if (!user) { setLocation("/login"); return; }
    if (isFavorite) {
      removeFavorite.mutate({ experienceId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
          toast({ title: "Rimosso dai preferiti" });
        },
      });
    } else {
      addFavorite.mutate({ data: { experienceId } }, {  
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
          toast({ title: "Aggiunto ai preferiti" });
        },
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const data = await validateCoupon({ code: couponCode });
      if (data?.valid && data.discountPercent != null && data.code) {
        setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
        toast({ title: `Coupon applicato! Sconto del ${data.discountPercent}%` });
      } else {
        setAppliedCoupon(null);
        toast({ title: data.message ?? "Coupon non valido", variant: "destructive" });
      }
    } catch {
      toast({ title: "Errore nella validazione del coupon", variant: "destructive" });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleBook = () => {
    if (!user) { setLocation("/login"); return; }
    if (!date) {
      toast({ title: "Seleziona una data", variant: "destructive" });
      return;
    }
    createBooking.mutate(
      {
        data: {
          experienceId,
          bookedDate: new Date(date).toISOString(),
          participants,
          couponCode: appliedCoupon?.code ?? null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Prenotazione confermata!", description: "Ti aspettiamo a Roma." });
          setLocation("/dashboard");
        },
        onError: (error: unknown) => {
          const msg = error instanceof Error ? error.message : "Errore sconosciuto";
          toast({ title: "Errore durante la prenotazione", description: msg, variant: "destructive" });
        },
      },
    );
  };

  const handleSubmitReview = () => {
    if (!user) { setLocation("/login"); return; }
    if (reviewComment.trim().length < 10) {
      toast({ title: "Il commento deve essere di almeno 10 caratteri", variant: "destructive" });
      return;
    }
    createReview.mutate(
      { id: experienceId, data: { rating: reviewRating, comment: reviewComment } },
      {
        onSuccess: () => {
          toast({
            title: "Recensione inviata!",
            description: "Sarà visibile dopo l'approvazione dell'amministratore.",
          });
          setReviewComment("");
          setReviewRating(5);
          setShowReviewForm(false);
        },
        onError: (error: unknown) => {
          const msg = error instanceof Error ? error.message : "Errore sconosciuto";
          toast({ title: "Errore nell'invio della recensione", description: msg, variant: "destructive" });
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">Caricamento...</div>
      </div>
    );
  if (!experience)
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">Esperienza non trovata</div>
      </div>
    );

  const today = format(new Date(), "yyyy-MM-dd");
  const basePrice = experience.price * participants;
  const discount = appliedCoupon ? basePrice * (appliedCoupon.discountPercent / 100) : 0;
  const finalPrice = basePrice - discount;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero image with favourite button */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[420px]">
              <img src={experience.imageUrl} alt={experience.title} className="w-full h-full object-cover" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm"
                onClick={handleToggleFavorite}
                disabled={addFavorite.isPending || removeFavorite.isPending}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`} />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-sm font-medium text-amber-600 mb-3">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{experience.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">({experience.reviewCount} recensioni)</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                  {experience.title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium">{experience.shortDescription}</p>
              </div>

              {/* Photo gallery */}
              {experience.galleryImages && experience.galleryImages.length > 0 && (
                <div>
                  <h2 className="text-xl font-serif font-bold mb-3">Galleria fotografica</h2>
                  <PhotoGallery images={experience.galleryImages} title={experience.title} />
                </div>
              )}

              <div className="flex flex-wrap gap-4 py-6 border-y border-border/50">
                <div className="flex items-center text-foreground">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">
                    {Math.floor(experience.durationMinutes / 60)}h{" "}
                    {experience.durationMinutes % 60 > 0 ? `${experience.durationMinutes % 60}m` : ""}
                  </span>
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
                  {experience.longDescription.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews section */}
            <div className="space-y-6 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Recensioni
                  {reviews && reviews.length > 0 && (
                    <span className="text-muted-foreground text-base font-normal">({reviews.length})</span>
                  )}
                </h2>
                {user && !showReviewForm && (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                    Scrivi una recensione
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <Card className="border shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-serif font-bold text-lg">La tua recensione</h3>
                    <div className="space-y-2">
                      <Label>Voto</Label>
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-comment">Commento</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Descrivi la tua esperienza (minimo 10 caratteri)..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSubmitReview} disabled={createReview.isPending}>
                        {createReview.isPending ? "Invio..." : "Invia recensione"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Annulla
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      La tua recensione sarà visibile dopo l'approvazione dell'amministratore.
                    </p>
                  </CardContent>
                </Card>
              )}

              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{review.userName ?? "Utente"}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), "dd MMMM yyyy", { locale: it })}
                            </p>
                          </div>
                          <StarRating value={review.rating} />
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                        {review.reply && (
                          <div className="mt-3 pl-4 border-l-2 border-primary/40 bg-accent/50 rounded-r-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-primary">Risposta dell'organizzatore</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Nessuna recensione ancora. Sii il primo!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
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

                    {/* Coupon code */}
                    <div className="space-y-2">
                      <Label htmlFor="coupon">Codice sconto</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="coupon"
                            placeholder="es. WELCOME10"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              if (appliedCoupon) setAppliedCoupon(null);
                            }}
                            className="pl-9 uppercase text-sm"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="shrink-0"
                        >
                          {validatingCoupon ? "..." : "Applica"}
                        </Button>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="rounded-lg bg-muted/50 p-4 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          €{experience.price} × {participants} pers.
                        </span>
                        <span>€{basePrice.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Sconto {appliedCoupon.discountPercent}% ({appliedCoupon.code})</span>
                          <span>-€{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base pt-1 border-t border-border/50">
                        <span>Totale</span>
                        <span>€{finalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleBook}
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? "Prenotazione..." : "Prenota ora"}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-2">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Cancella fino a 24 ore prima dell'inizio per un rimborso completo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
