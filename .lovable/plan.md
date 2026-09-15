# Deerva standartų pritaikymas pačiam deerva.com

Tikslas: deerva.com tampa savo paties standartų pavyzdiniu projektu — tiek,
kiek prasminga vienpuslapei platformai. Be enquiries, be maintenance režimo,
be viešo teksto CMS (landing tekstas lieka kode).

## 1. Business duomenys — `site_settings`

Viena eilutė duomenų bazėje su verslo tapatybe:

- pavadinimas, el. paštas, telefonas, adresas (miestas, šalis)
- socialinių tinklų nuorodos
- pagrindinis domenas (naudojamas SEO ir JSON-LD)

Naudojimas: kontaktinis el. paštas landing puslapyje ir Organization JSON-LD
skaitomi iš čia, ne iš kietai įrašyto teksto. Skaitymas viešoje dalyje —
per serverio funkciją SSR metu, kad puslapis liktų server-rendered.

Naujas admin puslapis **Settings** su **Business** tabu, kur šiuos laukus
redaguoji per panelę. Redaguoti gali owner/developer; editor mato read-only.

## 2. Admin meniu pertvarkymas

Dabar vienas „Workspace" blokas. Pagal standartą:

```text
DAILY
  Overview      (dabartinis Dashboard, pervadinamas)
  Analytics

MANAGE
  Clients       (Deervos kartojama esybė)

SETTINGS
  Users
  Settings      (naujas, Business tabas)
```

Overview puslapis pertvarkomas į tris blokus: „Needs attention",
„Numbers" (7 d. lankytojai, klientų skaičius), „Quick actions".
Sidebar apačia lieka kaip yra (el. paštas, rolės žymė, Back to site, Sign out).

## 3. SEO pagrindas

- `/` head papildomas: absoliutus `og:url` ir canonical į `https://deerva.com/`,
  `og:site_name`.
- **Organization JSON-LD** iš `site_settings` (pavadinimas, URL, logotipas,
  el. paštas, socialiniai profiliai).
- **`/sitemap.xml`** — generuojamas maršrutas (ne statinis failas), grąžina
  realius viešus URL.
- **`robots.txt`** — draudžia `/admin` ir `/api`, nurodo sitemap.
- **`noindex` tik ne kanoniniams hostams** (`*.lovable.app` preview):
  jei užklausos hostas ne `deerva.com`, siunčiamas `noindex`. Pats
  `deerva.com` lieka pilnai indeksuojamas.
- Admin maršrutai gauna `noindex`.

## 4. Projekto dokumentai

Standartas reikalauja trijų failų šaknyje. `AGENTS.md` jau yra; pridedami:

- `FRONTEND.md` — puslapių žemėlapis, kas ką skaito iš DB
- `PLAN.md` — kas padaryta ir kas toliau (enquiries, Appearance tabas,
  articles — kai prireiks)

## Techninės detalės

- Migracija: `CREATE TABLE public.site_settings` → `GRANT` → `ENABLE RLS` →
  politikos. Skaitymas: `anon` + `authenticated` (vieši duomenys). Rašymas:
  tik `is_manager()`. `created_at` / `updated_at` su trigeriu. Vienos eilutės
  garantija — `singleton boolean primary key`-tipo apribojimas.
- Migracijoje tik struktūra + viena numatytoji eilutė su tuščiais laukais;
  realūs duomenys suvedami per admin.
- Skaitymas/rašymas per `createServerFn` `src/lib/settings.functions.ts`;
  rašymas su `requireSupabaseAuth` middleware.
- Landing maršrutas gauna loader'į, kuris SSR metu ištraukia `site_settings`
  ir paduoda į `head()` JSON-LD bei kontaktinę nuorodą.
- `src/routes/sitemap[.]xml.ts` grąžina `Response` su `application/xml`.
- Jokių edge functions, jokių naujų priklausomybių.

## Ko šis planas neliečia

Landing puslapio dizaino ir teksto, analitikos logikos, rolių modelio,
el. pašto šablonų, `docs/standards/` turinio.
