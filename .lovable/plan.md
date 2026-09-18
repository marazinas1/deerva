# Deerva admin brandbook ir universalūs Skills

## Tikslas

Vieną kartą užfiksuoti Deerva admin panelių informacijos architektūrą, komponentų anatomiją ir elgesį, kad naujame ar esamame projekte pakaktų paprašyti „padaryk admin pagal Deerva standartus“. Prekės ženklo spalvos ir tipografija lieka projekto tokenuose; universali tampa struktūra, tankis, būsenos ir naudojimo logika.

Šio etapo rezultatas — standartai, aktyvūs workspace Skills, penkių esamų projektų auditas ir vienas paruoštas pritaikymo promptas. Pačių Lumidenta, OCDG, StageHomy, Halliday Architects ir Dorothe projektų kodas šiame etape nebus keičiamas.

## 1. Standartų architektūra

### Atnaujinti esamus standartus

- **00 — Content model**: aiškiai aprašyti, kad `site_settings` yra vienintelis Business & appearance šaltinis. Adresas, kontaktai, logo, favicon, žemėlapio koordinatės ir maintenance būsena iš jo automatiškai atsinaujina visoje svetainėje.
- **01 — Design system**: palikti bendrus tokenų, tipografijos, mygtukų, cursor, viešos svetainės pločio ir motion principus; papildyti semantinėmis statusų, šešėlių, laukų ir focus būsenų taisyklėmis.
- **02 — Admin structure**: perrašyti Settings tvarką ir ištaisyti esamą Markdown klaidą ties maintenance skyriumi.
- **README**: įtraukti naują admin UI brandbook standartą į privalomą skaitymo ir taikymo eilę.

### Sukurti atskirą admin UI brandbook standartą

Naujas dokumentas aprašys vizualinę ir komponentinę admin sistemą, kad struktūros taisyklės nesimaišytų su viešos svetainės dizainu.

Jame bus:

- admin shell anatomija: sidebar, mobile drawer, viršutinė juosta, pagrindinė turinio sritis;
- vienodas puslapio header: pavadinimas, vienas paaiškinimo sakinys, pagrindinis veiksmas dešinėje;
- visas turinio srities plotis visuose admin puslapiuose, ribojamas tik shell paddingo;
- aiški tankio skalė sąrašams, formoms, lentelėms ir dashboard blokams;
- kortelių standartas: 1 px semantinis rėmelis, vienas 6–8 px radius, jokio sunkaus šešėlio, pastovūs vidiniai tarpai;
- tabų standartas: aiškiai aprėminti, vienodo aukščio, visa aktyvi būsena matoma ne vien pabraukimu, telefone leidžiamas horizontalus slinkimas arba stabilus tinklelis;
- accordion standartas: ilgos Settings grupės, testimonials ir sudėtingi įrašai iš pradžių rodo santrauką, vienu veiksmu išsiskleidžia; „Expand all / Collapse all“ ilgiems sąrašams;
- formų anatomija: label, optional/recommended žyma, blankus placeholder, help/error tekstas, laukų grid, sticky arba aiški save zona;
- lentelių, filtrų, paieškos, toolbar, empty/loading/error/read-only būsenos;
- ikonų standartas: viena biblioteka, pastovūs dydžiai, ikonų mygtukams tooltip;
- interakcijos: pointer viskam, ką galima spausti; `not-allowed` disabled elementams; matomas focus; be dydžio šuolių;
- responsive taisyklės telefonui, planšetei ir desktop; jokio horizontalaus viso puslapio lūžimo;
- prekės ženklo išimtis: komponentų struktūra nekinta, bet jų spalvos ir šriftas visada ateina iš konkretaus projekto semantinių tokenų. Lumidenta žalia spalva lieka teisėta, ne hardcoded išimtis.

## 2. Fiksuota admin informacijos architektūra

Sidebar visada turi tik tris grupes:

```text
WORKSPACE
  Dashboard
  Inquiries
  Calendar arba Messages, tik kai to reikalauja sektorius
  Analytics

MANAGE
  <sektoriaus kartojama esybė>
  <kiti sektoriaus valdymo punktai>
  Articles
  Testimonials

SETTINGS
  Users
  Settings
```

Taisyklės:

- seka nustatoma pagal naudojimo dažnį;
- `Workspace` ir `Settings` vienodi visuose klientų projektuose;
- keičiasi tik `Manage` sektoriaus dalis;
- `Articles` ir `Testimonials` yra numatyti visuose klientų projektuose;
- Calendar ir Messages kartu nerodomi be realaus produkto poreikio;
- sidebar apačioje visada yra vartotojo el. paštas, rolė, „Back to site“ ir „Sign out“;
- Deerva vidinis valdymo projektas gali turėti dokumentuotą sektoriaus išimtį, bet naudoja tą pačią UI sistemą.

## 3. Settings modelis

Fiksuota tvarka:

1. **Business & appearance** — įmonės duomenys, adresas, telefonas, el. paštas, socialiniai tinklai, žemėlapio vieta, logo, logo dydis, favicon ir maintenance valdymas.
2. **Home** ir visi kiti viešos svetainės pagrindinio meniu puslapiai ta pačia eilės tvarka.
3. **Contact** — visada paskutinis tabas.

Papildomos taisyklės:

- naujas viešas puslapis ir jo Settings tabas sukuriami tuo pačiu pakeitimu;
- bendras arba teisinis turinys, kuris nėra pagrindinio meniu punktas, įdedamas prieš Contact arba į aiškų bendrą bloką — Contact vis tiek lieka paskutinis;
- kiekviename puslapio tabe redaguojami tekstai ir nuotraukos;
- owner gali pakeisti turinį ir pateikti „Set as default“ prašymą; tik developer patvirtina `page_media_defaults` / numatytąsias reikšmes;
- maintenance neturi atskiro tabo: tai suskleidžiamas blokas Business & appearance apačioje;
- maintenance lankytojo puslapis paveldi svetainės stilių ir rodo realų telefono numerį bei el. paštą iš Business duomenų;
- kol tikrinama autentifikacija, saugi numatytoji būsena yra paslėptas turinys;
- prisijungęs personalas mato tikrą svetainę su nuolatine maintenance juosta ir veiksmais peržiūrėti kaip lankytojui arba išjungti režimą.

## 4. Dashboard ir turinio valdymo modeliai

- Dashboard blokai: **Needs attention → Numbers → Quick actions**.
- Inquiries rodo aiškias skaityta/neperskaityta ir būsenų etiketes.
- Articles ir Testimonials sąrašai nėra perkrauti: pradžioje rodoma santrauka, detalės išskleidžiamos.
- Sąrašams su daug įrašų pridedami paieška, filtrai ir aiški tuščia būsena.
- Destructive veiksmai visada patvirtinami ir įvardija, kas bus prarasta.
- Save visada duoda toast; neišsaugoti pakeitimai įspėja prieš išeinant.
- Editor mato paaiškinančią read-only būseną, o ne tyliai dingusius valdiklius.

## 5. Workspace Skills

Standartus atspindės trys tarpusavyje aiškiai atskirti aktyvūs Skills:

1. **Deerva design system** — tokenai, tipografija, spalvų paveldėjimas, mygtukai, būsenos, cursor, radius, shadows, layout ir motion.
2. **Deerva admin structure** — sidebar grupės, meniu tvarka, Dashboard, Settings modelis, content/defaults, maintenance, rolėmis valdomas elgesys.
3. **Deerva admin UI brandbook** — konkretūs cards, tabs, accordions, forms, tables, toolbars, responsive ir accessibility komponentų receptai.

Bus pašalintas dubliavimas tarp Skills, bet paliktos trumpos tarpusavio nuorodos. Aktyvūs Skills bus atnaujinti per oficialų draft → apply procesą, ne tiesiogiai redaguojant workspace failus.

## 6. Penkių projektų auditas

Sukurti vieną audito dokumentą su atskira lentele kiekvienam projektui:

- Lumidenta
- OCDG
- StageHomy
- Halliday Architects
- Dorothe

Kiekvienoje lentelėje:

- kas jau atitinka standartą ir turi būti išsaugota;
- navigacijos, Settings tvarkos, tabų, kortelių, formų, tankio, responsive ir būsenų neatitikimai;
- duomenų modelio ar rolės priklausomybės, kurių negalima „sutvarkyti“ vien CSS;
- prioritetas: critical / important / polish;
- rekomenduojama pritaikymo seka be automatinio kodo keitimo.

Auditas remsis realiu penkių projektų kodu ir 13 pateiktų ekrano kopijų. Jis aiškiai skirs „gerą modelį, kurį perimame“ nuo hardcoded kodo ar spalvų, kurių nekopijuojame.

## 7. Naudojimas kituose projektuose

Paruošti vieną trumpą universalų promptą, kurį galima įklijuoti bet kuriame projekte. Jis nurodys:

- pritaikyti visus tris Deerva admin Skills;
- pirmiausia audituoti esamą projektą ir išsaugoti jo brand’o tokenus;
- nekeisti verslo logikos ar duomenų be poreikio;
- pateikti neatitikimų planą prieš didelį esamos panelės perstatymą;
- po įgyvendinimo patikrinti desktop ir mobile rodinius pagal brandbook checklistą.

Atnaujintas bendras Skills tekstinis eksportas bus paruoštas taip, kad jį būtų galima pateikti ir Claude.

## 8. Patikra

- Patikrinti, kad docs ir Skills nekonfliktuoja dėl Settings pirmo/paskutinio tabo, maintenance vietos, admin pločio ir spalvų.
- Patikrinti, kad nebeliko seno atskiro Appearance ar Maintenance tabo kaip privalomo modelio.
- Patikrinti, kad „clickable = pointer“ ir pilno admin pločio taisyklė yra vienoje autoritetingoje vietoje bei cituojama kitur.
- Patikrinti Markdown struktūrą ir kodo blokų uždarymą.
- Palyginti aktyvių Skills turinį su `docs/standards/` ir sugeneruotu Claude eksportu.

## Techninės ribos

- Šiame etape nebus keičiamas penkių audituojamų projektų kodas, jų spalvos ar duomenų bazės.
- Deerva admin UI nebus automatiškai perstatoma; auditas nurodys, ką taikyti atskiru etapu.
- Ekrano kopijos naudojamos kaip analizės įrodymai, bet neįtraukiamos į projekto saugyklą.
