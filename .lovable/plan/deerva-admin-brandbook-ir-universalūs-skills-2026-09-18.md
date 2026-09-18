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
- fiksuotas Lucide ikonų žodynas, kad ta pati paskirtis visuose projektuose turėtų tą pačią ikoną;
- interakcijos: pointer viskam, ką galima spausti; `not-allowed` disabled elementams; matomas focus; be dydžio šuolių;
- responsive taisyklės telefonui, planšetei ir desktop; jokio horizontalaus viso puslapio lūžimo;
- prekės ženklo išimtis: komponentų struktūra nekinta, bet jų spalvos ir šriftas visada ateina iš konkretaus projekto semantinių tokenų. Lumidenta žalia spalva lieka teisėta, ne hardcoded išimtis.

### Semantinių tokenų disciplina admine

- admin komponentai remiasi tik universaliomis semantinėmis rolėmis: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border` ir jų standartinėmis `*-foreground`, `input`, `ring` poromis;
- projektiniai spalvų sinonimai, pavyzdžiui `ink`, `stone`, `charcoal`, `slate`, `paper` ar `sand`, admin komponentuose draudžiami — jie gali likti tik viešos svetainės apvalkale;
- jokio `bg-white`, `text-black`, paletinių `emerald-*` / `amber-*` ar hex reikšmių admin komponente;
- `--radius` reikšmė lieka konkretaus brand'o dalis, bet visi admin komponentai naudoja tik iš jos išvestą bendrą radius skalę — jokių vietinių `rounded-[4px]` ar `rounded-full` tabų;
- admin ir vieša svetainė dalinasi tuo pačiu semantinių tokenų rinkiniu; atskira hardcoded admin paletė nekuriama.

### Fiksuotas ikonų žodynas

| Paskirtis | Lucide ikona |
|---|---|
| Dashboard | `LayoutDashboard` |
| Inquiries | `Inbox` |
| Calendar | `CalendarDays` |
| Messages | `MessageSquare` |
| Analytics | `BarChart3` |
| Projects / developments | `Building2` |
| Services | `BriefcaseBusiness` |
| Articles | `Newspaper` |
| Testimonials | `Quote` |
| Users | `UserCog` |
| Settings | `Settings` |
| Back to site | `ArrowLeft` |
| Sign out | `LogOut` |

Kitos sektoriaus esybės gauna vieną prasmiškai tikslų įrašą žodyne prieš jas kuriant; ta pati paskirtis vėliau negauna kitos ikonos. Sidebar ikonos naudoja vieną dydį, veiksmų ikonos — kitą dokumentuotą dydį, o ne individualius pasirinkimus.

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

Standartus atspindės keturi tarpusavyje aiškiai atskirti aktyvūs Skills:

1. **Deerva design system** — bendri tokenai, tipografija, spalvų paveldėjimas, mygtukai, būsenos, cursor, radius, shadows, viešos svetainės layout ir motion. Papildoma taisyklė: vieša svetainė ir admin dalinasi vienu semantinių tokenų rinkiniu.
2. **Deerva admin structure** — atsako „kas egzistuoja ir kur“: sidebar grupės, meniu tvarka, Dashboard, Settings modelis, content/defaults, maintenance ir rolėmis valdomas matomumas. Nulis vizualinių receptų.
3. **Deerva admin UI** — atsako „kaip tai atrodo“: shell, cards, tabs, forms, tables, toolbars, ikonų žodynas, tankis, responsive ir accessibility. Nulis hex reikšmių ir projektinių tokenų.
4. **Deerva admin screens** — atsako „iš ko sudarytas ekranas ir kaip jis elgiasi“: suskleidžiami sąrašai, vienu metu atvertas įrašas, „Expand all / Collapse all“, redagavimas vietoje ar dialoge, publikavimo jungikliai, rikiavimas, media slotai, default prašymai, toast ir neišsaugotų pakeitimų apsauga.

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

Privalomos audito išvados:

- **Halliday Architects** žymimas kaip artimiausias Settings struktūros etalonas: `Business & appearance` jau sujungtas, o maintenance jau yra to paties puslapio blokas;
- **StageHomy** žymimas „estetika sektina, kodas nekopijuojamas“: plonos linijos, plokštumos ir tankis perrašomi semantiniais tokenais nuo nulio, neperkeliant gausaus hardcoded spalvų kodo;
- **Lumidenta** audite atskirai pažymimas dubliuotas kelias į puslapių turinį: tekstai lieka Settings tabuose, tikros esybės keliamos į Manage;
- **OCDG** ir **Dorothe** atskiras Maintenance tabas pažymimas perkėlimui į `Business & appearance` bloką;
- spalvų, radius ir tipografijos skirtumai, kylantys iš taisyklingų brand'o tokenų, nelaikomi neatitikimais.

Pirmas realus pritaikymo etapas po šio brandbook darbo bus **Halliday Architects**: jo Settings struktūra jau arčiausiai standarto, todėl čia mažiausia rizika vienu metu supainioti struktūros ir vizualo pakeitimus. Tik patikrinus receptus realiame desktop ir mobile ekrane, rekomenduojama seka yra StageHomy → OCDG → Dorothe → Lumidenta. Šis pritaikymas yra kitas etapas ir į dabartinį dokumentacijos bei Skills darbą neįtrauktas.

## 7. Naudojimas kituose projektuose

Paruošti vieną trumpą universalų promptą, kurį galima įklijuoti bet kuriame projekte. Jis nurodys:

- pritaikyti visus keturis Deerva admin Skills;
- pirmiausia audituoti esamą projektą ir išsaugoti jo brand’o tokenus;
- nekeisti verslo logikos ar duomenų be poreikio;
- pateikti neatitikimų planą prieš didelį esamos panelės perstatymą;
- po įgyvendinimo patikrinti desktop ir mobile rodinius pagal brandbook checklistą.

Atnaujintas bendras Skills tekstinis eksportas bus paruoštas taip, kad jį būtų galima pateikti ir Claude.

## 8. Patikra

- Patikrinti, kad docs ir Skills nekonfliktuoja dėl Settings pirmo/paskutinio tabo, maintenance vietos, admin pločio ir spalvų.
- Patikrinti, kad nebeliko seno atskiro Appearance ar Maintenance tabo kaip privalomo modelio.
- Patikrinti, kad „clickable = pointer“ ir pilno admin pločio taisyklė yra vienoje autoritetingoje vietoje bei cituojama kitur.
- Patikrinti, kad ikonų žodynas vardais sutampa visuose admin Skills ir audito rekomendacijose.
- Patikrinti, kad admin receptuose nėra projektinių spalvų sinonimų, hardcoded spalvų ar lokalių radius reikšmių.
- Patikrinti Markdown struktūrą ir kodo blokų uždarymą.
- Palyginti aktyvių Skills turinį su `docs/standards/` ir sugeneruotu Claude eksportu.

## Techninės ribos

- Šiame etape nebus keičiamas penkių audituojamų projektų kodas, jų spalvos ar duomenų bazės.
- Deerva admin UI nebus automatiškai perstatoma; auditas nurodys, ką taikyti atskiru etapu.
- Ekrano kopijos naudojamos kaip analizės įrodymai, bet neįtraukiamos į projekto saugyklą.
