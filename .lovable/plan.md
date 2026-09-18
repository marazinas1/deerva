# Deerva Standards Library

## Tikslas

Sukurti vidinę Deerva standartų biblioteką administravimo dalyje, kad vienoje vietoje būtų matomi:

- visi patvirtinti Deerva standartai;
- reusable admin prompt ir kiti metodiniai dokumentai;
- visų aktyvių Skills turinys ir jų ryšys su standartais;
- pakeitimų juodraščiai;
- kiekvieno projekto naudojamos versijos, atitiktis ir sąmoningos išimtys.

Patvirtinti repository dokumentai lieka vieninteliu source of truth. Admin jų tiesiogiai neperrašo: pakeitimai pirmiausia saugomi kaip juodraščiai, o pritaikius pakeitimą per Lovable pokalbį pažymimi įgyvendintais.

## Informacijos architektūra

Sidebar grupėje **Manage** pridėti **Standards** po Projects ir prieš Finance.

Puslapis `/admin/standards` turės vieną bendrą header ir bordered tabs:

1. **Library** — standartų ir metodinių dokumentų kolekcija.
2. **Skills** — aktyvūs Skills, susieti su atitinkamu standartu; aiškiai rodyti, jei turinys nesutampa arba Skill neturi poros.
3. **Project coverage** — projektų ir standartų matrica su versijomis bei būsenomis.
4. **Drafts** — siūlomi pakeitimai ir pastabos.

Library ir Skills turės search, kategorijos filtrą, būseną ir rezultatų skaičių. Dokumento skaitymui naudoti atskirą pilno pločio detail route, ne mažą modalą. Markdown rodyti su turinio sąrašu, aiškia dokumento rūšimi, dabartinės versijos žyma ir susijusiais elementais.

## Versijos ir projektų atitiktis

Kiekvieno patvirtinto dokumento dabartinė versija bus nustatoma pagal jo turinio revision hash, todėl keičiantis failui versija pasikeis automatiškai ir nereikės dubliuoti dokumento duomenų bazėje.

Kiekvieno projekto–standarto ryšys saugos:

- pritaikytą revision;
- būseną: `compliant`, `review_needed`, `exception`, `not_applicable`;
- trumpą išimties arba peržiūros pastabą;
- paskutinės peržiūros datą ir kas ją atliko.

Kai dabartinis dokumento revision skiriasi nuo projekte įrašyto, UI rodys **Review needed**, tačiau automatiškai nepakeis vartotojo įrašytos išimties ar versijos.

Projects kortelės redagavimo lange pridėti kompaktišką **Standards coverage** santrauką: bendrą būseną, kiek standartų reikia peržiūrėti ir nuorodą į tam projektui filtruotą Project coverage vaizdą. Ilgos matricos į projekto modalą nedėti.

## Juodraščiai

**New draft** bus vienintelis pagrindinis puslapio veiksmas. Juodraštis turės:

- susietą standartą arba Skill;
- pavadinimą ir pakeitimo priežastį;
- siūlomą Markdown turinį;
- bazinį revision, nuo kurio pradėta;
- būseną: `draft`, `ready`, `implemented`, `archived`;
- autorių ir datas.

Admin išsaugo pasiūlymą, bet nepublikuoja jo tiesiai į repository ar workspace Skills. Įgyvendinus per Lovable, developeris gali pažymėti juodraštį kaip implemented; biblioteka parodys naują failo revision.

## Teisės ir duomenys

Pridėti dvi vidines lenteles:

- `standard_drafts`;
- `project_standard_assignments` su ryšiu į esamą `clients` lentelę.

Toje pačioje migracijoje kiekvienai lentelei įtraukti GRANT, RLS, indeksus ir `updated_at` trigger. Visi admin staff gali skaityti; developer/owner gali valdyti juodraščius ir projektų atitiktį. Saugumo taisyklės remsis esamomis `is_admin_staff()` ir `is_manager()` security-definer funkcijomis.

Patvirtintų dokumentų ir Skills tekstai į duomenų bazę nekopijuojami. Serverio funkcija pateiks saugų manifestą su pavadinimu, kategorija, tipu, turiniu, revision ir ryšiais; UI nematys vidinių repository kelių.

## Techninis įgyvendinimas

- Sukurti Standards manifestą iš esamų standartų, reusable prompt, audit dokumento ir aktyvių Skills turinio.
- Papildyti assistant knowledge registrą trūkstamais admin UI/screens ir prompt dokumentais, kad biblioteka ir Deerva assistant remtųsi ta pačia pilna kolekcija.
- Sukurti autentifikuotas `createServerFn` funkcijas bibliotekos skaitymui, drafts CRUD ir project coverage valdymui.
- Sukurti React Query hooks ir routes `/admin/standards`, `/admin/standards/$slug`.
- Naudoti esamus `AdminPageHeader`, `AdminTabs`, semantic tokens, bordered cards/tables, loading/empty/error/read-only būsenas ir aiškius status labels.
- Neredaguoti generuojamo route tree; jis atsikurs iš route failų.

## Patikra

- TypeScript patikra ir migration lint.
- Developer/owner gali kurti juodraščius ir keisti coverage; editor mato read-only paaiškinimą.
- Paieška, filtrai, dokumento skaitymas, draft dirty state ir delete confirm veikia.
- Projekto revision pasikeitimas teisingai sukelia Review needed indikaciją.
- Desktop, tablet ir phone neturi viso puslapio horizontalaus overflow; tabs, matrica ir detail ekranas pasiekiami klaviatūra.
- Viešas Deerva puslapis ir esama Projects/Finance logika nekeičiami.
