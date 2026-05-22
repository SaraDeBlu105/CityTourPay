# City Tour Italy — Guida operativa

## Come aggiungere un nuovo coupon
1. Accedi come admin
2. Vai su **Admin → Coupon**
3. Compila il form:
   - **Codice**: es. `WELCOME10` (automaticamente in maiuscolo)
   - **Sconto (%)**: es. `10` per 10%
   - **Valido fino al**: es. `2025-12-31`
4. Clicca **Crea coupon**

Gli utenti inseriscono il codice nel campo "Codice sconto" nella pagina di dettaglio esperienza e cliccano **Applica**. Lo sconto viene mostrato nel riepilogo prima di confermare.

## Come approvare o cancellare una recensione
1. Accedi come admin
2. Vai su **Admin → Recensioni in attesa**
3. Ogni card mostra autore, voto e commento
4. **Approva**: la recensione diventa visibile pubblicamente e aggiorna il rating medio dell'esperienza
5. **Elimina**: rimuove definitivamente la recensione

## Come rispondere a una recensione
1. Vai su **Admin → Recensioni in attesa**
2. Clicca **Rispondi** sulla card desiderata
3. Scrivi la risposta nel campo di testo
4. Clicca **Salva risposta** — la risposta viene salvata nel DB e mostrata sotto la recensione approvata

## Come diventare admin (prima volta)
Esegui questa query SQL direttamente sul database:
```sql
UPDATE users SET is_admin = true WHERE email = 'tuo@email.com';
```
Poi esegui di nuovo il login per ottenere un token JWT aggiornato con `isAdmin: true`.

## File principali
| File | Scopo |
|------|-------|
| `artifacts/city-tour-italy/src/pages/experience.tsx` | Pagina dettaglio esperienza: prenotazione, coupon, recensioni |
| `artifacts/city-tour-italy/src/pages/admin.tsx` | Dashboard admin: moderazione recensioni + gestione coupon |
| `artifacts/city-tour-italy/src/pages/dashboard.tsx` | Dashboard utente: prenotazioni, preferiti, profilo |
| `artifacts/api-server/src/routes/admin.ts` | API admin (approvazione, risposta, delete recensioni; CRUD coupon) |
| `artifacts/api-server/src/routes/reviews.ts` | API pubblica recensioni |
| `artifacts/api-server/src/routes/coupons.ts` | API validazione coupon |
| `lib/db/src/schema/reviews.ts` | Schema DB tabella reviews |
| `lib/db/src/schema/coupons.ts` | Schema DB tabella coupons |
| `lib/api-spec/openapi.yaml` | Contratto OpenAPI (source of truth) |

## Come rigenerare il client API dopo modifiche allo schema OpenAPI
```bash
pnpm --filter @workspace/api-spec run codegen
```
Questo comando aggiorna sia i Zod schemas (`lib/api-zod`) che gli hook React Query (`lib/api-client-react`).

## Come applicare modifiche allo schema DB
```bash
pnpm --filter @workspace/db run push
```
