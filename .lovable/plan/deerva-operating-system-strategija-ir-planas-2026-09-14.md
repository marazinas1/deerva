# Deerva Operating System — strategija ir planas

Tikslas: paversti svetainių kūrimą pakartojamu produktu. Kiekvienas naujas klientas = 80% jau paruošta, 20% pritaikymo. Šis planas nieko dar nekoduoja — jis nustato, kas bus rašoma ir kokia tvarka.

## Ką parodė projektų analizė

Lumidenta sekėsi sklandžiai ne dėl sektoriaus, o dėl to, kad projektas prasidėjo nuo trijų dokumentų prieš pirmą eilutę kodo:

- `AGENTS.md` — taisyklės (kas leidžiama, kas draudžiama)
- `FRONTEND.md` — turinio modelis ir puslapių žemėlapis su visais redaguojamais laukais
- `PLAN.md` — etapų eiliškumas

Svarbiausia jų dalis — „turinio taisyklė": kiekvienas tekstas ar paveikslėlis priklauso lygiai vienai iš trijų vietų:

| Jei tai… | Gyvena | Pavyzdys |
|---|---|---|
| matoma keliuose puslapiuose | `site_settings` | logotipas, adresas, telefonas, favicon |
| viena vieta viename puslapyje | `page_text` / `page_media` | hero antraštė, CTA tekstas |
| kartojasi sąrašu | atskira lentelė | paslaugos, objektai, straipsniai |

Dorothe projektas strigo, nes prasidėjo kaip „universalus produktas" be šio sprendimo iš anksto. OCDG prireikė migracijos dėl tos pačios priežasties. Halliday davė roles ir `page_media_defaults` mechaniką, StageHomy — vizualinį kalbos etaloną.

Išvada: nestandartizuojame kodo — standartizuojame **sprendimus, priimamus prieš kodą**.

## Trys sluoksniai

```text
1. DOKUMENTAI (šaltinis)     .md failai Deerva repo — standartų tekstas
2. SKILLS (taikymas)          workspace skills — automatiškai galioja visuose projektuose
3. DEERVA ADMIN (valdymas)    klientai, projektai, statusai, standartų versijos
```

Skills yra būtent tai, ko ieškai: markdown instrukcijos, saugomos workspace lygyje, kurias Lovable automatiškai pritaiko bet kuriame tavo projekte, kai užduotis atitinka. Nereikia kaskart kopijuoti failų. Dokumentai lieka šaltiniu, skills — vykdymo mechanizmas.

## Etapas 1 — Standartų dokumentai

Rašomi į `docs/standards/` šiame Deerva projekte. Kiekvienas trumpas, sprendimų, o ne teorijos.

**`00-content-model.md`** — trijų kategorijų taisyklė, slot pavadinimų konvencija (`page:slot`), default/reset mechanika (`page_media_defaults`), „jei klientas kada nors norės antro — reikia lentelės" testas.

**`01-design-system.md`** — spalvų tokenai (semantiniai, niekada hardcoded), tipografija, mygtukų hierarchija (primary/secondary/ghost/destructive) su tiksliu elgesiu hover/focus/disabled, sekcijų pločiai ir vertikalūs tarpai, scroll/hover efektai (StageHomy kalba), mobile taisyklės. Draudimai: default šriftai, purple gradientai, atsitiktiniai shadow.

**`02-admin-structure.md`** — meniu privaloma tvarka: **Kasdien** (Apžvalga, Užklausos, Žinutės, Analitika) → **Valdymas** (sektoriaus turinys) → **Nustatymai** (tabai). Nustatymų tabai: Verslo duomenys · Išvaizda (logo, dydis, favicon) · po vieną tabą kiekvienam viešam puslapiui · Techniniai darbai. Logotipas visur vienodo dydžio, ateina iš `site_settings`, paspaudus — grįžta į pradžią ir nuskrolina į viršų.

**`03-roles-and-access.md`** — `developer > owner > editor`, rutkusmarius@gmail.com hardcoded developer visuose projektuose, vardai ir paskutiniai prisijungimai matomi, „prašyti nustatyti kaip numatytąjį" eilė developeriui.

**`04-seo-and-performance.md`** — SSR privalomas, per-route head(), sitemap, robots, JSON-LD pagal sektorių, og:image, Core Web Vitals ribos, paveikslėlių optimizavimas.

**`05-analytics-and-attribution.md`** — cookie-free tracking, botų filtras, 5s engagement, footer'io badge su UTM (`?utm_source=klientas.lt&utm_medium=referral&utm_campaign=platform-badge`), sniego gniūžtės efektas.

**`06-project-lifecycle.md`** — kaip pradedamas naujas klientas: remix → sektoriaus žemėlapis → subdomenas `vardas.deerva.com` → publikavimas kliento domene → subscription. Ką klientas gali keisti pats, ko negali.

**`07-tech-baseline.md`** — TanStack Start + SSR, Lovable Cloud, server functions, RLS ant kiekvienos lentelės, el. pašto infrastruktūra, be edge functions.

## Etapas 2 — Skills

Iš dokumentų padaromi 3–4 workspace skills (Settings → Skills), kad galiotų automatiškai:

- `deerva-new-project` — paleidžia naują projektą pagal lifecycle ir content model
- `deerva-design-system` — taikomas bet kuriam UI darbui
- `deerva-admin-panel` — taikomas bet kuriam admin darbui
- `deerva-seo-baseline` — taikomas prieš publikavimą

Dokumentas lieka šaltiniu; skill yra jo santrauka, kurią Lovable įkelia pats.

## Etapas 3 — Deerva admin kaip štabas

Tik po to, kai standartai surašyti. Turimas `clients` registras praplečiamas:

- **Projektai** — kiekvienas klientas turi projektą: sektorius, koncepto numeris, subdomenas / domenas, statusas (konceptas → kuriama → peržiūra → gyvas → palaikomas), Lovable projekto nuoroda, GitHub repo
- **Subscription** — mėnesinis mokestis, ciklas, kita sąskaita, MRR suma dashboard'e
- **Konceptai** — 10 vizualinių krypčių biblioteka su rotacijos žyma, kad du to paties sektoriaus klientai negautų vieno koncepto
- **Standartai** — dokumentų sąrašas su versijomis ir žyma, kurie projektai kurią versiją atitinka
- **Apžvalga** — kiek gyvų platformų, MRR, užklausos iš badge'o srauto

## Ko šiame plane nedarome

Nekeičiamas viešas Deerva puslapis, analitika ar esama autentifikacija. Nekuriamas starter template projektas — jis prasminga tik tada, kai standartai jau surašyti ir bent vienas projektas (Dorothe arba Lumidenta) juos atitinka 100%; tada jis tampa remix šaltiniu.

## Techninės detalės

Dokumentai — paprasti markdown failai `docs/standards/`, be kodo priklausomybių. Skills kuriami per Settings → Skills (importuojami iš to paties markdown). Etapo 3 duomenų bazės darbas — nauja `projects` lentelė su nuoroda į `clients`, `subscriptions`, `concepts`, visos su RLS ir GRANT pagal esamą `is_admin_staff` / `is_manager` modelį; admin maršrutai pagal jau veikiantį `_authenticated/admin` šabloną.

## Siūloma pradėti

Nuo `00-content-model.md`, `01-design-system.md` ir `02-admin-structure.md` — jie duoda didžiausią naudą iškart, nes būtent jų trūkumas kainavo brangiausiai Dorothe ir OCDG projektuose.
