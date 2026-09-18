---
name: deerva-design-system
description: Naudok bet kokiam Deerva projekto UI darbui — spalvų tokenams, tipografijai, mygtukų hierarchijai, sekcijų išdėstymui, animacijoms ir vizualiniams draudimams. Netinka duomenų modeliui, rolėms ar SEO nustatymams.
---

# 01 — Dizaino sistema

StageHomy yra etalonas erdvei, ritmui ir judesiui — sekcijų tarpams, hover efektams, bendram santūrumui. Jo paties komponentų kodo tiesiogiai nekopiijuoti: Header.tsx, Footer.tsx, HeroSection.tsx ir kt. turi kietai įrašytų spalvų, kurias šis standartas draudžia. Perimama estetika, ne kodas. Lumidenta — etalonas, kaip ją pritaikyti šiltam paslaugų verslui. Abu „santūrūs, užtikrinti, dosnūs erdvei" — tai ir yra Deerva stilius.

## Tokenai

Visos spalvų, šešėlių ir šriftų reikšmės yra **semantiniai CSS tokenai** faile `src/styles.css`. Niekada hardcoded spalvos komponente — jokio `text-white`, `bg-black`, `bg-[#1a1a1a]`.

```css
:root {
  --background / --foreground
  --card / --card-foreground
  --primary / --primary-foreground
  --secondary / --secondary-foreground
  --muted / --muted-foreground
  --accent / --accent-foreground
  --destructive / --destructive-foreground
  --border / --input / --ring
}
@theme inline { --color-background: var(--background); ... }
```

Kiekviename projekte keičiasi **reikšmės**. **Vardai** — niekada. Būtent dėl to remix'as tampa vieno failo perdažymu.

## Tipografija

- Viena šeima projektui, kraunama per `<link>` root route head — niekada `@import` URL CSS faile (Tailwind v4 lūžta).
- Urbanist yra numatytoji. Nukrypstama tik jei to reikalauja prekės ženklas, ir tada sąmoningai — niekada Inter ar Poppins iš inercijos.
- Svoriai: 300 / 400 / 500 / 600 / 700 / 800. Antraštės 600–700, tekstas 400, žymos 500.
- Tekstas 16–17px, line-height 1.6. Antraštės su sutrauktu tracking.
- Mažų didžiųjų raidžių žymos: 11px, `uppercase`, `tracking-[0.14em]`, muted spalva. Sekcijų „eyebrow" ir admin grupių pavadinimai.

## Mygtukai — hierarchija fiksuota

| Variantas | Kam | Taisyklė |
|---|---|---|
| `primary` | vienas veiksmas, vedantis vartotoją pirmyn | **daugiausia vienas viename ekrano regione** |
| `secondary` / `outline` | realios alternatyvos | bet kiek |
| `ghost` | mažo svorio navigacija, toolbar veiksmai | be rėmelio iki hover |
| `destructive` | tik trynimas | visada su patvirtinimu |
| `link` | tekste | pabraukimas, accent ant hover |

Elgesys visur vienodas:

- hover: subtilus, ~150ms, opacity arba vienas atspalvis — niekada dydžio šuolis
- focus-visible: realiai matomas žiedas, visada (klaviatūros vartotojai nėra pasirinktinis dalykas)
- disabled: 50% opacity, be pointer events
- loading: spinneris pakeičia tekstą, plotis nesikeičia

## Žymeklis (cursor)

- Kiekvienas interaktyvus elementas — mygtukai, nuorodos, paspaudžiamos
  kortelės, lentelės eilutės, kurios ką nors atidaro, ikonų mygtukai —
  užvedus pelę rodo `cursor: pointer`.
- Išjungti (disabled) elementai rodo `cursor: not-allowed`.
- Neinteraktyvus tekstas niekada nerodo pointer žymeklio.

## Išdėstymas

- Puslapio konteineris: `max-w-7xl` su `px-4 md:px-6 lg:px-8`. Teksto blokai iki ~65 simbolių.
- Sekcijų vertikalus ritmas: `py-16 md:py-24`. Hero gali būti didesnis; mažesnio nebūna.
- Full-bleed sekcijos leidžiamos ir skatinamos — turinys viduje vis tiek laikosi konteinerio.
- Radius: viena skalė, vienas `--radius`. Nemaišyti aštrių ir pill formų tame pačiame vaizde.
- Šešėliai: StageHomy skalė (labai švelnūs, maža opacity). Niekada kietas drop shadow.

## Judesys

Santūrumas yra stilius. Leidžiama:

- `fade-up` (opacity + ~30px translateY, 0.6–0.8s ease-out) sekcijai įeinant į ekraną, vieną kartą
- paveikslėlio scale ant hover, iki 1.03, 400–600ms
- 150ms spalvos/opacity perėjimai interaktyviems elementams

Neleidžiama: parallax, atšokimai, automatiniai karuselės, bet kas, kas juda kol vartotojas skaito.

`prefers-reduced-motion: reduce` viską išjungia. Visada.

## Draudžiama pagal nutylėjimą

Numatytieji sisteminiai šriftai · purple/indigo gradientai ant balto · stock nuotraukos kaip užpildas · ikonų sriuba · apvalintos kortelės su sunkiais šešėliais ant gradientų · trys konkuruojantys primary mygtukai · vienodi hero/nav/footer šablonai.

## Variacija tarp klientų

Ta pati struktūra, kitas apvalkalas. Konceptas = paletė + šriftų pora + hero kompozicija + sekcijų ritmas. Dešimt konceptų rotacijoje reiškia, kad du to paties sektoriaus klientai neatpažins vienas kito svetainės — ir niekas nebuvo perstatyta iš nulio.
