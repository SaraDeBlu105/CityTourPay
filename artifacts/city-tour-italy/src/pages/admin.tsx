import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListPendingReviews,
  getListPendingReviewsQueryKey,
  useApproveReview,
  useReplyToReview,
  useDeleteReview,
  useListCoupons,
  getListCouponsQueryKey,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Review,
  type Coupon,
} from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Star, Check, Trash2, MessageSquare, Tag, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function PendingReviewCard({ review }: { review: Review }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.reply ?? "");

  const approve = useApproveReview();
  const replyMutation = useReplyToReview();
  const deleteMutation = useDeleteReview();

  const handleApprove = () => {
    approve.mutate({ id: review.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingReviewsQueryKey() });
        toast({ title: "Recensione approvata" });
      },
      onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: review.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingReviewsQueryKey() });
        toast({ title: "Recensione eliminata" });
      },
      onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id: review.id, data: { reply: replyText } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingReviewsQueryKey() });
        toast({ title: "Risposta salvata" });
        setShowReplyForm(false);
      },
      onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
    });
  };

  return (
    <Card className="border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold">{review.userName ?? "Utente"}</span>
              <Badge variant="secondary" className="text-xs">In attesa</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Esperienza #{review.experienceId} · {format(new Date(review.createdAt), "dd MMM yyyy", { locale: it })}
            </p>
          </div>
          <StarDisplay rating={review.rating} />
        </div>

        <p className="text-muted-foreground text-sm">{review.comment}</p>

        {review.reply && (
          <div className="pl-4 border-l-2 border-primary/40 bg-accent/50 rounded-r p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Risposta attuale</span>
            </div>
            <p className="text-xs text-muted-foreground">{review.reply}</p>
          </div>
        )}

        {showReplyForm && (
          <div className="space-y-2">
            <Textarea
              placeholder="Scrivi una risposta pubblica..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} disabled={replyMutation.isPending}>
                {replyMutation.isPending ? "Salvataggio..." : "Salva risposta"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                Annulla
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={approve.isPending}
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Approva
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            {showReplyForm ? "Nascondi risposta" : "Rispondi"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Elimina
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const handleToggle = () => {
    updateMutation.mutate({ id: coupon.id, data: { isActive: !coupon.isActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        toast({ title: coupon.isActive ? "Coupon disattivato" : "Coupon attivato" });
      },
      onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: coupon.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        toast({ title: "Coupon eliminato" });
      },
      onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
    });
  };

  const isExpired = coupon.validUntil < new Date().toISOString().split("T")[0];

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-3 pr-4">
        <span className="font-mono font-bold text-sm tracking-wider">{coupon.code}</span>
      </td>
      <td className="py-3 pr-4 text-center">
        <span className="font-semibold text-primary">{coupon.discountPercent}%</span>
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        <span className={isExpired ? "text-destructive line-through" : ""}>
          {format(new Date(coupon.validUntil), "dd/MM/yyyy")}
        </span>
        {isExpired && <span className="ml-1 text-xs text-destructive">(scaduto)</span>}
      </td>
      <td className="py-3 pr-4">
        <Badge variant={coupon.isActive && !isExpired ? "default" : "secondary"}>
          {coupon.isActive && !isExpired ? "Attivo" : "Inattivo"}
        </Badge>
      </td>
      <td className="py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleToggle} disabled={updateMutation.isPending}>
            {coupon.isActive ? "Disattiva" : "Attiva"}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [validUntil, setValidUntil] = useState("");

  const { data: pendingReviews, isLoading: loadingReviews } = useListPendingReviews({
    query: { queryKey: getListPendingReviewsQueryKey(), enabled: !!user?.isAdmin },
  });

  const { data: coupons, isLoading: loadingCoupons } = useListCoupons({
    query: { queryKey: getListCouponsQueryKey(), enabled: !!user?.isAdmin },
  });

  const createCoupon = useCreateCoupon();

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-bold mb-2">Accesso negato</h2>
            <p className="text-muted-foreground">Non hai i permessi per accedere a questa pagina.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !validUntil) return;
    createCoupon.mutate(
      { data: { code: couponCode.toUpperCase(), discountPercent: Number(discountPercent), validUntil } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
          toast({ title: "Coupon creato con successo" });
          setCouponCode("");
          setDiscountPercent("10");
          setValidUntil("");
        },
        onError: (e: unknown) => toast({ title: (e as Error).message, variant: "destructive" }),
      },
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-5xl flex-1">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Pannello Admin</h1>
          </div>
          <p className="text-muted-foreground">Moderazione recensioni e gestione coupon</p>
        </div>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recensioni in attesa
              {pendingReviews && pendingReviews.length > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Coupon
            </TabsTrigger>
          </TabsList>

          {/* Pending reviews tab */}
          <TabsContent value="reviews" className="space-y-4">
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : pendingReviews && pendingReviews.length > 0 ? (
              pendingReviews.map((review) => (
                <PendingReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-60" />
                  <h3 className="text-xl font-serif font-medium mb-2">Nessuna recensione in attesa</h3>
                  <p className="text-muted-foreground">Tutte le recensioni sono state moderate.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Coupons tab */}
          <TabsContent value="coupons" className="space-y-6">
            {/* Create coupon form */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Crea nuovo coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-code">Codice</Label>
                    <Input
                      id="coupon-code"
                      placeholder="es. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="uppercase font-mono tracking-wider"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-discount">Sconto (%)</Label>
                    <Input
                      id="coupon-discount"
                      type="number"
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon-valid-until">Valido fino al</Label>
                    <Input
                      id="coupon-valid-until"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createCoupon.isPending} className="bg-primary text-primary-foreground">
                    {createCoupon.isPending ? "Creazione..." : "Crea coupon"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Coupons list */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Coupon esistenti</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCoupons ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : coupons && coupons.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border/50">
                          <th className="pb-3 pr-4 text-left">Codice</th>
                          <th className="pb-3 pr-4 text-center">Sconto</th>
                          <th className="pb-3 pr-4 text-left">Scadenza</th>
                          <th className="pb-3 pr-4 text-left">Stato</th>
                          <th className="pb-3 text-left">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon) => (
                          <CouponRow key={coupon.id} coupon={coupon} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nessun coupon creato.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
