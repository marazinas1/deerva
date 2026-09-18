---
name: deerva-content-model
description: Naudok sprendžiant, kur gyvena svetainės tekstas, paveikslėlis ar kartojami duomenys, kaip veikia site_settings, slotai, defaults ir reset. Netinka vizualiniam dizainui ar rolėms.
---

# 00 — Turinio modelis

Sprendžiama prieš pirmą komponentą. Kiekvienas tekstas, skaičius ir paveikslėlis priklauso lygiai vienai vietai.

| Jei tai… | Gyvena | Pavyzdys |
|---|---|---|
| matoma keliuose puslapiuose ir redaguojama vieną kartą | `site_settings` | logo, favicon, adresas, žemėlapio taškas, telefonas, el. paštas, licencijos, socialiniai tinklai, maintenance būsena |
| matoma vieną kartą, vienoje vietoje, viename puslapyje | `page_text` / `page_media` | hero antraštė, CTA pastraipa, citatos kortelė |
| kartojasi kaip panašių dalykų sąrašas | atskira lentelė | paslaugos, skelbimai, projektai, straipsniai, atsiliepimai, kainos, DUK |

**Testas:** jei klientas kada nors norėtų antro — reikia lentelės.

## Bazinės lentelės

```text
site_settings          viena eilutė; Business & appearance
page_text              (page, slot, value)
page_media             (page, slot, bucket, path, alt)      kliento pasirinkimas
page_media_defaults    (page, slot, bucket, path, alt)      developerio numatytasis
user_roles             rolės arba Team-tier teisių modelis
leads                   užklausos
page_views              analitika
```

Visa kita priklauso nuo sektoriaus.

## Business & appearance — vienas šaltinis

Pirmas Settings tabas valdo vienintelę `site_settings` eilutę. Iš jos visur skaitomi įmonės pavadinimas, adresas, žemėlapio koordinatės/nuoroda, telefonas, el. paštas, socialiniai tinklai, logo, logo dydis, favicon ir maintenance būsena.

Išsaugojus pakeitimą, jis automatiškai atsispindi viešuose puslapiuose, footer, Contact, žemėlapyje, schema.org, prisijungimo lange ir admin sidebar. Šių reikšmių nedubliuoti `page_text`, puslapio komponente ar kitoje settings lentelėje.

## Slotai, defaults ir reset

Slotas: `page:slot`, mažosiomis raidėmis, be taškų, aprašo poziciją, ne dabartinį tekstą.

```text
home:hero_heading       teisinga
home:dantu_prieziura    klaidinga
```

```text
image: kliento page_media → developerio page_media_defaults → null
text:  page_text → fallback tekstas komponente
```

Reset pašalina kliento override ir atidengia default; jis nekopijuoja failo. Kiekviena matoma eilutė turi `copy()` fallback, todėl svetainė veikia ir be duomenų bazės įrašo.

## Griežtos taisyklės

1. Migracijos aprašo struktūrą, ne realius klientų duomenis; išimtis tik būtinos pirmo ekrano demo eilutės.
2. Vaizdai visada optimizuojami: resize, WebP, EXIF pašalinimas; pakeitus ar ištrynus valomas senas objektas.
3. Logo yra `site_settings` reikšmė, ne importas.
4. Kiekviena lentelė gauna `created_at`, `updated_at` su trigeriu, GRANT, RLS ir policies toje pačioje migracijoje.
5. Pradedant projektą įvardyti kartojamą esybę; ji nulemia Manage grupę ir sektoriaus lenteles.
