# Standartai: sekcijų plotis, žymeklis ir kaip tai galioja visiems projektams

Du dalykai, kuriuos kaskart tenka aiškinti iš naujo (rankytės žymeklis ant kortelių ir sekcijų plotis), tampa rašytine taisykle. Taisyklė gyvena dviejose vietose: šio projekto `docs/standards/` ir Skills, kurie galioja visam workspace'ui.

## Kaip veikia Skills (trumpai, bet iš esmės)

- **Knowledge** — visada įjungta atmintis. Workspace knowledge matoma visuose projektuose, project knowledge — tik viename. Tinka trumpoms, visada galiojančioms taisyklėms.
- **Skills** — įrašytos instrukcijos, kurios įsijungia pagal poreikį: kai užduotis atitinka skill'o aprašymą arba kai iškviečiate ranka per `/skill-name`. Jos yra **workspace lygio** — įrašytos vieną kartą, galioja visuose jūsų projektuose. Todėl į atskirą projektą galima ateiti ir pasakyti „padaryk admin panelę pagal Deerva standartus".
- Skills valdomos per **Settings → Skills**. Juodraštį galiu paruošti iš projekto, bet aktyvuoti (arba atnaujinti aktyvų) reikia ten — aktyvių skills failų tiesiogiai keisti negaliu, jie kaskart atstatomi iš workspace.
- Svarbu: skill'o atnaujinimas **nepersidaro senų projektų savaime**. Jis galioja naujam darbui. Seniems projektams reikia vieno sakinio komandos („pritaikyk Deerva standartus šiam projektui") — ją ir paruošiu.

Praktinis modelis, kurį siūlau laikyti: `docs/standards/` = šaltinis, Skills = to paties teksto kopija, veikianti visur. Keičiant vieną — keičiam abu.

## Ką pridedame į standartus

### 1. Sekcijų plotis (kaip Lumidenta)

Viena taisyklė, galiojanti ir viešoms svetainėms, ir admin panelei: turinys naudoja beveik visą ekraną, be didelių tuščių laukų šonuose, bet su tvarkingomis paraštėmis.

- Bendras konteineris: `w-full max-w-[1600px] mx-auto`, paraštės `px-4 sm:px-6 lg:px-10 xl:px-14`.
- Sekcijos fonas — visada per visą plotį; ribojamas tik turinys.
- Vieno stulpelio tekstas (straipsnis, ilga pastraipa) — iki ~70 simbolių pločio, tai vienintelė išimtis.
- Tinkleliai tankinami stulpelių skaičiumi (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`), o ne konteinerio siaurinimu.
- Vertikalus ritmas vienodas visuose puslapiuose; pereinant tarp puslapių turinys neturi šokinėti į šoną.
- Admin lieka kaip yra: visas plotis, jokių `max-w-3xl` salų.

Tai keičia dabartinę `01-design-system.md` eilutę (`max-w-7xl`) į platesnį, Lumidentos ritmą atitinkantį variantą.

### 2. Žymeklis ir interaktyvumas

- Bet kas, ką galima paspausti — kortelė, eilutė, plytelė, paveikslėlis — turi `cursor-pointer`, matomą hover būseną ir klaviatūros fokusą.
- Nespaudžiami elementai niekada negauna rankytės.
- Neaktyvus elementas: `cursor-not-allowed`, 50% permatomumo.
- Spaudžiama kortelė yra `button` arba `Link`, ne `div` su `onClick`.

## Failai

- `docs/standards/01-design-system.md` — naujas skyrius „Section width" ir „Clickable surfaces"; pakeičiama sena `max-w-7xl` eilutė.
- `docs/standards/02-admin-structure.md` — nuoroda į bendrą pločio taisyklę, kad neliktų dviejų skirtingų versijų.
- `.agents/skills/deerva-design-system/SKILL.md` — tas pats tekstas, paruoštas aktyvavimui.
- `.agents/skills/deerva-admin-structure/SKILL.md` — atitinkamas patikslinimas.

## Ko jums reikės padaryti pačiam

1. Settings → Skills atnaujinti `deerva-design-system` ir `deerva-admin-structure` iš paruoštų juodraščių (vienas mygtukas).
2. Kitame projekte (pvz. Lumidenta ar naujame) parašyti: „Pritaikyk Deerva design-system ir admin-structure standartus šiam projektui" — likusį darbą jis padarys pats.

## Ko šis planas neliečia

Šio projekto kodo nekeičiame — Deerva admin jau atitinka pločio taisyklę, o rankytė ant projektų kortelių jau pridėta. Tai grynai standartų ir Skills darbas.
