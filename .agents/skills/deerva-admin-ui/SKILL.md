---
name: deerva-admin-ui
description: Naudok kuriant ar audituojant Deerva admin vizualą — shell, cards, tabs, forms, tables, ikonų žodyną, tankį, responsive ir accessibility. Struktūrai naudok deerva-admin-structure, workflow ekranams deerva-admin-screens.
---

# 02A — Admin UI brandbook

Šis skill atsako **kaip admin atrodo**. Komponentų anatomija bendra, o spalvos, pagrindinis sans šriftas ir radius ateina iš kiekvieno projekto semantinių tokenų. StageHomy estetika sektina, Halliday yra tabų etalonas, bet jų hardcoded admin kodas niekada nekopijuojamas.

## Tokenai

Admin naudoja tik core roles: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border` ir standartines foreground/input/ring/status poras. Draudžiami projektiniai aliases (`ink`, `stone`, `paper`, `sand`, `charcoal`, `slate`), raw/hex spalvos ir atskira admin paletė.

`--radius` ir `--font-sans` lieka brand'o reikšmės; jokio vietinio arbitrary radius, atskiro admin šrifto ar pill tabų. Visas admin, įskaitant antraštes, naudoja `--font-sans`; public serif/display taisyklės į admin nepatenka.

## Shell ir page header

Desktop: collapsible sidebar + top utility bar + flexible main. Mobile: drawer, užsidarantis po navigacijos. Logo virš meniu, account/session veiksmai apačioje. Main padding vienas, route neprideda siauro wrapper.

Kiekvienas puslapis prasideda unframed header: kairėje h1 + vienas sakinys, dešinėje daugiausia vienas primary veiksmas. Mobile veiksmas persikelia žemyn; niekas nepersidengia.

## Surface receptai

Halliday Architects admin yra paviršių etalonas: šviesus `bg-background` puslapis, ramios baltos `bg-card` sekcijos su borders, vienas sans šriftas, erdvūs laukai, jokių dekoracijų.

- Section: full-width, unframed, `space-y-4/6`.
- Card: `border border-border bg-card text-card-foreground`, radius tik iš `--radius`, `p-5` standard arba `p-4` compact, be shadow.
- Settings/forma: vertikalus tokių cards stack'as su vienodu `space-y-6`; viena kortelė = viena tema ir savo `Save`.
- Kortelės viduje: `text-sm font-medium` title, optional `text-xs text-muted-foreground` sakinys, tada `grid gap-4 sm:grid-cols-2`; ilgi laukai per visą eilę.
- Clickable card: pointer + subtilus border/background hover + focus ring, be scale.
- Inset: `bg-muted`, border tik jei trūksta atskyrimo.
- Nenestinti dekoratyvių cards į cards.
- Rows 40–44 px, controls 36–40 px, gaps 16–24 px.
- Inputs, buttons ir cards ima tą patį `--radius`; niekas neatrodo aštriau ar apvaliau už kaimyną.

## Tabs

Vienas shared AdminTabs visur: skaidri horizontali eilė su viena apatine `border-border` linija. Trigger neturi užpildyto stačiakampio ar radius; active yra `text-foreground`, medium ir su ryškiai matomu apatiniu `primary` pabraukimu — storesne 3 px linija, akivaizdžia nei apatinius juosianti `border-border` linija (Halliday tipo). Inactive — `text-muted-foreground`. Default tekstas normalaus registro; tik aiškiai pavadintas stiprus brand variantas gali būti bold uppercase. Mobile visada horizontaliai scrollinama viena eilė, label nekerpami.

## Badges

Badges yra privalomas informacijos sluoksnis listuose, cards ir detail headers. Jie leidžia greitai nuskaityti rolę, tapatybę ir būseną.

- Naudoti rolėms (`Developer`, `Owner`, `Editor`), dabartiniam vartotojui (`You`), publikavimui (`Published`, `Hidden`), workflow/status, `Read only` ir attention būsenoms.
- Visur naudoti shared Badge komponentą: compact inline-flex label, optional 14–16 px Lucide icon, semantic border, token-derived radius, stabilus aukštis. Badge vizualiai tylesnis už button.
- Neutral identity/role: `secondary`, `muted` arba outline. Product state: tik `success`, `warning`, `info`, `destructive` su jų foreground poromis.
- Visada rodyti aiškų tekstą; spalva viena reikšmės neperduoda. Ikona tik kai padeda atpažinti, pvz. `ShieldCheck` saugomai rolei.
- Badge eina iškart po title/name. Keli badges dedami į wrapping inline row su vienodu mažu gap ir negali išstumti row actions.
- `You` ir `Developer` gali būti kartu: pirmas žymi tapatybę, antras teisių lygį.
- Badge yra informacija, ne veiksmas. Nenaudoti kaip button, tab, toggle, filter ar dekoratyvaus tag cloud. Trumpi label, paprastai 1–3 žodžiai; nedubliuoti akivaizdžios informacijos.

## Forms

Label visada virš control. Optional/recommended žyma prie label. Placeholder blankus ir neatrodo kaip saved value. Help ir error po lauku. Fields: `grid gap-4 sm:grid-cols-2`; ilgi tekstai/adresai/media per visą eilę. Save zona su top border, Save ir dirty/saving/saved būsena; ilgai formai galima sticky, jei neuždengia turinio. Read-only forma paaiškina, kas gali keisti.

## Tables, lists, accordions

Search + filters viename toolbar, create — page header. Desktop table turi stabilius stulpelius. Mobile naudoja vidinį horizontal scroll arba specialų row/card, bet ne viso puslapio overflow. Didelės kolekcijos turi pagination/load-more. Daugiau nei du row actions — overflow menu.

Expandable records pradžioje rodo title, state, order ir santrauką. Atidaryta forma inline; default vienas atvertas. Ilgiems sąrašams „Expand all / Collapse all“. `aria-expanded`, focus ir chevron privalomi.

## Būsenos

Loading rezervuoja galutinį layout; empty paaiškina situaciją ir vieną kitą veiksmą; error siūlo retry ir nepraranda formos; read-only paaiškina rolę. Statusas turi label/icon, ne vien spalvą.

## Ikonų žodynas

Lucide. Sidebar/action 16 px, section 20 px.

| Paskirtis | Ikona |
|---|---|
| Dashboard | `LayoutDashboard` |
| Inquiries | `Inbox` |
| Calendar | `CalendarDays` |
| Messages | `MessageSquare` |
| Analytics | `BarChart3` |
| Projects/developments | `Building2` |
| Services | `BriefcaseBusiness` |
| Articles | `Newspaper` |
| Testimonials | `Quote` |
| Users | `UserCog` |
| Settings | `Settings` |
| Back to site | `ArrowLeft` |
| Sign out | `LogOut` |

Naujai sektoriaus esybei vieną ikoną įrašyti prieš kuriant UI ir visur kartoti. Icon-only mygtukas turi tooltip ir accessible name.

## Interaction ir responsive

Interactive = pointer; disabled = not-allowed; focus-visible ring visada. Touch target bent 40 px kur praktiška. Hover ~150 ms ir nekeičia layout. Reduced motion gerbiamas; admin be dekoratyvių scroll animacijų.

Patikrinti phone/tablet/desktop: sidebar pilnas; header nesikerta; tabs pasiekiami; formos tvarka logiška; visos list/table actions išlieka; dialogs telpa; nėra viso puslapio horizontalaus scroll.
