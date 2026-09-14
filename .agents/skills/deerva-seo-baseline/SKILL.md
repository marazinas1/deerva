---
name: deerva-seo-baseline
description: Naudok, kai tvarkai Deerva projekto SEO ar našumą — per-route head metaduomenis, JSON-LD pagal sektorių, sitemap ir robots, Core Web Vitals, paveikslėlių optimizavimą arba paleidimo checklist prieš perjungiant kliento domeną. Netinka analitikai ar admin struktūrai.
---

# 04 — SEO ir našumas

Kiekviena Deerva platforma turi užsidirbti srautą. Graži svetainė, kurios niekas neranda, nėra produktas.

## Renderinimas

Server-side rendering kiekvienam viešam puslapiui. Nediskutuojama — būtent dėl to stack'as yra TanStack Start, o ne paprastas SPA. Admin dalis — vienintelė client-rendered.

## Per-page head

Kiekvienas viešas route turi savo `head()`. Root route nėra pakaitalas.

```
title           iki 60 simbolių, su puslapio raktažodžiu, baigiasi prekės ženklu
description     iki 160 simbolių, žmogui, unikalus kiekvienam puslapiui
og:title / og:description
og:type         website (pradžia) / article (straipsnis)
twitter:card    summary_large_image kai yra realus paveikslėlis
og:image        tik absoliutus https URL — niekada bundled import, niekada reliatyvus
canonical
```

Placeholder antraštės „Home" ar bendras aprašymas keliems puslapiams laikomi bug'ais.

## Struktūra

- Vienas `<h1>` puslapyje, ir jis pasako, apie ką puslapis.
- Semantinis HTML: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Alt tekstas kiekvienam paveikslėliui, rašomas to, kas įkelia — alt laukas yra įkėlimo formos dalis admin'e.
- Vidinės nuorodos — realūs anchor'ai, niekada `onClick` navigacija.

## Mašininis skaitomumas

`JSON-LD` pagal sektorių, generuojamas iš `site_settings`, kad liktų teisingas klientui pakeitus adresą:

| Sektorius | Schema |
|---|---|
| Odontologija / klinika | `Dentist` / `MedicalBusiness` + `OpeningHoursSpecification` |
| Architektai / studija | `ProfessionalService` + `Organization` |
| Brokeris | `RealEstateAgent`, skelbimai kaip `Residence` / `Offer` |
| Vystytojas | `Organization` + `Place` kiekvienam projektui |
| Bet kur | `BreadcrumbList`, `Article` straipsniuose, `FAQPage` kur yra DUK |

## Crawling

- `sitemap.xml` generuojamas iš realių route'ų ir publikuotų duomenų bazės eilučių, ne statinis failas.
- `robots.txt` leidžia viską viešo, draudžia `/admin` ir `/api`, ir nurodo sitemap, kai atsiranda realus domenas.
- Kol projektas gyvena `*.deerva.com`, jis turi `noindex`. `noindex` ir robots blokas nuimami kartu — tame pačiame commit'e, niekada atskirai.

## Našumo biudžetas

- LCP iki 2.5s per 4G, CLS iki 0.1, INP iki 200ms.
- Paveikslėliai: WebP, teisingi matmenys, `loading="lazy"` žemiau lanksto, aiškus width/height, kad niekas nešokinėtų.
- Hero paveikslėlis preload; visa kita lazy.
- Šriftai: viena šeima, `display=swap`, preconnect į šriftų hostą.
- Jokio trečios šalies script be rašytinės priežasties.

## Paleidimo checklist

Prieš nukreipiant kliento domeną:

- [ ] kiekvienas viešas route turi unikalų title ir description
- [ ] sitemap grąžina realius URL, robots teisingas, `noindex` nuimtas
- [ ] JSON-LD validuojasi
- [ ] og:image atsidaro kaip absoliutus URL
- [ ] Lighthouse SEO ir Accessibility 95+
- [ ] 404 puslapis egzistuoja ir veda į pradžią
- [ ] analitika fiksuoja realius apsilankymus
- [ ] Deerva footer badge vietoje
