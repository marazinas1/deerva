---
name: deerva-tech-baseline
description: Naudok, kai renkiesi ar tikrini Deerva projekto techninį pagrindą — stack'ą, server functions vs api routes, migracijų tvarką su GRANT ir RLS, routing struktūrą, el. pašto siuntimą iš projekto domeno, storage pipeline ir privalomus projekto dokumentus. Netinka vizualiniam dizainui.
---

# 07 — Techninis pagrindas

Tas pats stack'as kiekviename projekte. Vienodumas ir yra esmė: kartą parašytas taisymas galioja visur.

## Stack

- **TanStack Start v1** su React 19 ir SSR. Ne paprastas Vite SPA — SSR būtinas dėl SEO.
- **Vite 7**, deployinama į edge worker runtime.
- **Tailwind v4**, CSS-first. Tokenai `src/styles.css` po `@theme` / `@theme inline`. Jokio `tailwind.config.js`.
- **shadcn/ui** komponentai, pritaikomi per variantus, niekada nekopijuojami į vienkartines versijas.
- **Lovable Cloud** duomenų bazei, auth, storage ir secrets.

## Serverio kodas

- Vidinė logika: `createServerFn` iš `@tanstack/react-start`. Failai `*.functions.ts`, serverio helperiai `*.server.ts`.
- Išoriniai kvietėjai (webhooks, cron): file routes po `src/routes/api/public/*`, su parašo ar secret patikrinimu handler'io viduje.
- **Jokių edge functions.** Senuose projektuose tai buvo netinkamas sluoksnis ir sukėlė migracijas.
- Secrets skaitomi handler'io viduje, niekada module scope. Niekada naršyklės kode.

## Duomenų bazė

- Kiekviena vieša lentelė, toje pačioje migracijoje: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → politikos.
- `created_at` ir `updated_at` visur, su atnaujinimo trigeriu.
- Politikos kviečia security-definer rolių funkcijas; niekada tiesiogiai neužklausia `user_roles`.
- Nuo laiko priklausanti validacija — trigeriais, ne `CHECK` constraint'ais.
- Migracijos aprašo tik struktūrą.

## Routing

- Vieši puslapiai: top-level route failai, SSR įjungtas, be auth vartų.
- Apsaugoti puslapiai: po `src/routes/_authenticated/`, vartai vieną kartą layout'e.
- Kiekvienas nuorodoje minimas route egzistuoja. Kiekvienas tėvinis route renderina `<Outlet />`.

## El. paštas

- Auth ir transakciniai laiškai siunčiami iš projekto subdomeno (`notify.<kliento-domenas>`), niekada iš platformos numatytojo siuntėjo.
- Šablonai brandinti kiekvienam projektui, gyvena `src/lib/email-templates/`.
- SPF, DKIM ir DMARC patikrinti prieš paleidimą — pristatomumas yra produkto dalis.

## Storage

- Kliento įkėlimai eina per optimizavimo pipeline: resize, WebP, EXIF pašalinimas.
- Keičiant ar trinant paveikslėlį senas objektas ištrinamas. Jokių našlaičių.

## Projekto dokumentai

Kiekvienas repo turi `AGENTS.md`, `FRONTEND.md` ir `PLAN.md` šaknyje, parašytus prieš statybą ir palaikomus aktualiais. Agentas, perskaitęs tik šiuos tris failus, turi gebėti teisingai dirbti projekte.

## Definition of done

Funkcija baigta, kai klientas ja galėtų naudotis be apmokymo.
