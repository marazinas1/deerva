---
name: deerva-content-model
description: Naudok, kai sprendi, kur gyvena tekstas, paveikslėlis ar duomenys Deerva projekte — site_settings, page_text/page_media ar atskira lentelė; kai kuri slot'ų pavadinimus, default/reset mechaniką arba planuoji sektoriaus lenteles. Netinka vizualiniam dizainui ar rolėms.
---

# 00 — Turinio modelis

Sprendžiama prieš pirmą komponentą. Būtent ši klaida po pusmečio paverčia CMS skausmu.

## Trijų kategorijų taisyklė

Kiekvienas tekstas, skaičius ir paveikslėlis priklauso lygiai vienai vietai.

| Jei tai… | Gyvena | Pavyzdys |
|---|---|---|
| matoma **keliuose puslapiuose**, redaguojama vieną kartą | `site_settings` | logo, favicon, adresas, telefonas, el. paštas, licencijos, socialiniai tinklai |
| matoma **vieną kartą, vienoje vietoje, viename puslapyje** | `page_text` / `page_media` | hero antraštė, CTA pastraipa, citatos kortelė |
| **kartojasi** kaip panašių dalykų sąrašas | atskira lentelė | paslaugos, skelbimai, projektai, straipsniai, atsiliepimai, kainos, DUK |

**Testas:** *jei klientas kada nors norėtų antro — reikia lentelės.* Paslauga nėra teksto slot'as — jie pridės septintą. Hero antraštė nėra lentelė — jos visada tik viena.

## Lentelės, kurias turi kiekvienas projektas

```
site_settings          viena eilutė; verslo tapatybė + išvaizda
page_text              (page, slot, value)
page_media             (page, slot, bucket, path, alt)      kliento pasirinkimas
page_media_defaults    (page, slot, bucket, path, alt)      developerio numatytasis
user_roles             developer / owner / editor
leads                  kontaktų formos užklausos
page_views             analitika
```

Visa kita — sektoriaus specifika.

## Slot'ų vardai

`page:slot`, mažosiomis raidėmis, be taškų, aprašo **poziciją**, niekada dabartinį tekstą.

```
home:hero_heading        teisingai — išgyvena teksto perrašymą
home:dantu_prieziura     blogai — miršta vos pakeitus tekstą
```

## Numatytosios reikšmės ir atstatymas

Eilė:

```
image:  kliento page_media  →  developerio page_media_defaults  →  null (komponentas slepia slot'ą)
text:   page_text reikšmė   →  fallback eilutė komponente
```

Taip „reset to default" veikia nemokamai: ištrini eilutę — grįžta numatytoji. Jokio undo log, jokio versijavimo.

**Kiekviena matoma eilutė komponente gauna `copy()` iškvietimą su dabartiniu tekstu kaip fallback.** Svetainė pilnai renderinasi dar prieš atsirandant pirmai duomenų bazės eilutei, o klientas redaguoja veikiantį tekstą, ne tuščius laukus.

## Griežtos taisyklės

1. **Jokių kliento duomenų migracijose.** Migracijos aprašo struktūrą. Tikri vardai, kainos, darbo laikas ir nuotraukos suvedami per admin. Vienintelė išimtis — demo eilutės, kai pirmas ekranas negali būti tuščias paleidimo metu.
2. **Paveikslėliai visada eina per optimizavimo pipeline** — resize, WebP, EXIF pašalinimas. Ištrynus ar pakeitus nuotrauką senas failas dingsta iš storage. Našlaičiai failai jau kandžiojo kitus projektus.
3. **Adresas, telefonas ir el. paštas visur skaitomi iš `site_settings`** — footer, kontaktai, žemėlapis, schema.org. Niekada hardcoded komponente.
4. **Logotipas yra `site_settings` reikšmė, ne import.**
5. **Kiekviena lentelė gauna `created_at`, `updated_at` (su trigeriu), RLS ir GRANT** toje pačioje migracijoje, kuri ją sukuria.

## Sektorių žemėlapis

Keičiasi tik „kartojamų dalykų" lentelė. Visa kita lieka identiška.

| Sektorius | Kartojama esybė |
|---|---|
| Odontologija / klinika | `services`, `working_hours`, `appointments` |
| Architektai | `projects` su etapais ir galerijomis |
| NT brokeris | `listings` su statusu, media, užklausomis |
| Vystytojas / statybos | `developments` su butais ir statybos statusu |
| Vizualizacijų studija | `portfolio_items` |

Pradedant naują projektą pirmiausia parašoma viena eilutė: *„kartojama esybė yra X"*. Visa kita seka iš standartų.
