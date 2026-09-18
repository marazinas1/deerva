---
name: deerva-design-system
description: Naudok bet kokiam Deerva projekto UI darbui — semantiniams tokenams, tipografijai, mygtukams, būsenoms, cursor, viešos svetainės pločiams ir motion. Admin komponentų anatomijai papildomai naudok deerva-admin-ui.
---

# 01 — Dizaino sistema

StageHomy yra erdvės, ritmo ir santūrumo etalonas; Lumidenta — šilto paslaugų brando pritaikymo etalonas. Perimama estetika, ne komponentų kodas ar hardcoded spalvos.

## Vienas semantinių tokenų kontraktas

Vieša svetainė ir admin dalinasi tuo pačiu rinkiniu `src/styles.css`:

```css
--background / --foreground
--card / --card-foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive / --destructive-foreground
--border / --input / --ring
--success / --success-foreground
--warning / --warning-foreground
--info / --info-foreground
--shadow-sm / --shadow-md
```

Vardai nekinta; reikšmės yra kiekvieno brando dalis. Jokio `text-white`, `bg-black`, `bg-[#…]`, `emerald-*` ar `amber-*` komponentuose. Admin nenaudoja projektinių sinonimų `ink`, `stone`, `paper`, `sand`, `charcoal`, `slate`; jie leidžiami tik specifiniame viešos svetainės apvalkale.

## Tipografija

- Kiekvienas projektas turi vieną sąmoningai pasirinktą pagrindinį `--font-sans`, kraunamą root `<head>` per `<link>`, niekada CSS URL `@import`.
- Public body, visas admin ir auth ekranai naudoja tą patį `--font-sans`. Admin ir auth antraštėms draudžiami `--font-serif` ir `--font-display`.
- Viešos svetainės antraštės gali turėti papildomą serif/display šriftą, bet jo selektoriai scope'inami taip, kad nepatektų į admin ar auth. Nedėti jo globaliai ant plikų `h1`–`h6`, jei ekranai dalijasi dokumentu.
- Urbanist — default, bet brandas gali sąmoningai rinktis kitą sans; nekrauti atskiro admin šrifto.
- Svoriai 300–800; antraštės 600–700, body 400, labels 500.
- Body 16–17 px, line-height apie 1.6. Mažos uppercase admin grupių žymos: 11 px, `tracking-[0.14em]`.

## Mygtukai

| Variantas | Paskirtis |
|---|---|
| primary | vienas veiksmas, vedantis pirmyn; daugiausia vienas ekrano regione |
| secondary / outline | realios alternatyvos |
| ghost | toolbar ir mažo svorio veiksmai |
| destructive | tik trynimas, visada po patvirtinimo |
| link | inline tekste |

Hover ~150 ms, be dydžio šuolio. Focus-visible žiedas visada matomas. Disabled: 50 % opacity ir `not-allowed`. Loading spinneris pakeičia tekstą nekeisdamas mygtuko pločio.

## Laukai ir būsenos

Label visada matomas. Placeholder yra blanki formato užuomina, niekada neatrodo kaip įvesta reikšmė. Help ir error tekstas aprašo veiksmą žodžiais. Statusai naudoja tik `success`, `warning`, `info`, `destructive`; spalva nėra vienintelis signalas.

## Cursor

Visi mygtukai, nuorodos, ikonų veiksmai, paspaudžiamos kortelės ir atidaromos lentelių eilutės rodo `cursor: pointer`. Disabled rodo `not-allowed`. Neinteraktyvus turinys pointer nerodo.

## Viešos svetainės layout

- Vidinis konteineris: `max-w-7xl` su `px-4 md:px-6 lg:px-8`.
- Sekcijos: `py-16 md:py-24`; full-bleed fonas leidžiamas, turinys lieka konteineryje.
- Teksto blokas iki ~65 simbolių eilutėje.
- Admin pločio taisykles aprašo deerva-admin-structure ir deerva-admin-ui.

## Radius, shadows, motion

`--radius` yra brando reikšmė; komponentai naudoja tik išvestą skalę, be `rounded-[4px]` ar dekoratyvių pill tabų. Lumidenta gali būti minkštesnė už OCDG nekeičiant komponento anatomijos.

Paviršius dažniausiai skiria border. `--shadow-sm/md` labai švelnūs, daugiausia overlays ir dialogs.

Leidžiama: vienkartinis fade-up, image hover scale iki 1.03, 150 ms spalvų/opacity perėjimai. Draudžiama: parallax, bouncing, autoplay ir judėjimas skaitant. `prefers-reduced-motion` viską išjungia.
