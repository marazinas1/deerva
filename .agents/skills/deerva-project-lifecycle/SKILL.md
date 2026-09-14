---
name: deerva-project-lifecycle
description: Naudok, kai pradedamas naujas Deerva kliento projektas arba jis keliauja per statusus concept → building → review → live → maintained — remix, subdomenas, projekto dokumentai, domeno perjungimas, ką klientas gali keisti, prenumeratos forma. Netinka konkrečiam UI ar duomenų modelio darbui.
---

# 06 — Projekto gyvavimo ciklas

Nuo pirmo pokalbio iki pasikartojančių pajamų. 80% produkto jau egzistuoja; likusius 20% suplanuoja šis dokumentas.

## Statusai

```
concept  →  building  →  review  →  live  →  maintained
```

Sekama Deerva admin'e, po vieną eilutę kiekvienam kliento projektui.

## 1. Concept

Prieš bet kokį kodą:

- įvardyti **sektorių** ir **kartojamą esybę**
- parinkti **vizualinį konceptą** iš rotacijos, patikrinus, kad to paties sektoriaus ir rinkos klientas jo dar neturi
- parašyti tris projekto dokumentus:
  - `AGENTS.md` — kas šis klientas, ką tekstas gali ir ko negali sakyti, kas buvo pašalinta iš remix šaltinio, sektoriaus teisiniai apribojimai
  - `FRONTEND.md` — puslapių žemėlapis: kiekvienas puslapis, kiekvienas redaguojamas slot'as, kurias lenteles skaito
  - `PLAN.md` — statybos eiliškumas

Šis žingsnis yra skirtumas tarp Lumidenta ir Dorothe. Jo niekada nepraleidžiame „kad sutaupytume laiko".

## 2. Building

- remiksuojamas artimiausias užbaigtas projektas, tada **ištrinama tai, kas nepriklauso**, o ne pritaikoma — likučiai iš šaltinio projekto yra pagrindinė vėlesnės painiavos priežastis
- statoma ant `<vardas>.deerva.com` su `noindex`
- viena užduotis viename prompt'e; plan mode viskam struktūriniam
- jokių realių kliento duomenų migracijose

## 3. Review

Klientas gauna owner paskyrą ir savaitę naudoja admin su realiu turiniu. Deerva stebi, ties kuriais ekranais jis dvejoja, ir taiso būtent juos, o ne tuos, kuriuos buvo sunku pastatyti.

## 4. Live

Perjungimas į kliento domeną:

- DNS nukreiptas, HTTPS patvirtintas
- `noindex` ir robots blokas nuimti vienu pakeitimu
- sitemap pateiktas
- auth laiškai siunčiami iš kliento domeno
- Deerva badge su teisingu UTM source footer'yje
- SEO paleidimo checklist pilnai atžymėtas

## 5. Maintained

Prasideda mėnesinė prenumerata. Ji dengia hostingą, atnaujinimus, saugumą, atsargines kopijas, nedidelę pagalbą su turiniu ir tolesnį vystymą. Didesnės naujos funkcijos kainuojamos atskirai.

Klientas valdo savo turinį. Deerva valdo architektūrą ir dizaino sistemą. Ta riba ir yra produktas: kasdien jie nepriklausomi, o viskam struktūriniam — priklausomi, ir už tai gauna realią vertę.

## Ką klientas gali ir ko negali keisti

| Klientas | Deerva |
|---|---|
| logo, logo dydis, favicon | spalvų tokenai ir tipografija |
| adresas, telefonas, el. paštas, darbo laikas, socialiniai | puslapių struktūra ir išdėstymas |
| visi puslapių tekstai ir paveikslėliai | komponentai ir funkcijos |
| kartojama esybė (pridėti/keisti/trinti) | duomenų bazės schema |
| straipsniai | SEO instaliacija |
| vartotojai (tik owner) | domenai, el. paštas, infrastruktūra |
| techninių darbų režimas | dizaino sistema |

## Kainodaros forma

Pastatymo mokestis iš karto, tada mėnesinė priežiūros prenumerata, sąskaitos 6 mėnesių blokais. Etalonas — OCDG: 250 USD/mėn., sąskaita 1500 USD du kartus per metus.
