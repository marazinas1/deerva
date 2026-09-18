# Deerva admin pritaikymas pagal galutinius standartus

## Tikslas

Paversti patį Deerva administravimą pirmuoju etaloniniu naujojo admin brandbook įgyvendinimu, nekeičiant veikiančios projektų, finansų, analitikos, vartotojų ar nustatymų logikos.

## Kas bus sutvarkyta

### 1. Bendras administravimo karkasas
- Išlaikyti tris grupes: **Workspace / Manage / Settings** ir esamas Deerva išimtis.
- Suvienodinti viršutinę juostą, šoninį meniu, paskyros bloką ir mobile drawer elgesį.
- Visuose puslapiuose naudoti visą turinio plotį su vienodu bendro karkaso tarpu.
- Pašalinti dubliuotą „Back to site“ veiksmą iš viršutinės juostos, nes jis jau yra sidebar apačioje.

### 2. Viena semantinė dizaino sistema
- Admin komponentuose pakeisti `ink / stone / paper / sand / line` ir žalias, gintarines ar raudonas hardcoded klases į bendrus semantinius tokenus.
- Išlaikyti dabartinį šviesų Deerva admin vaizdą, bet jo reikšmes aprašyti tik per standartines roles: background, foreground, card, primary, secondary, muted, accent, destructive, border ir status roles.
- Pašalinti nereikalingus šešėlius iš mygtukų ir tabų, palikti aiškius kontūrus bei focus būsenas.

### 3. Bendri administravimo komponentai
- Sukurti bendrą pilno pločio puslapio antraštę.
- Sukurti vieną rėmeliais atskirtą `AdminTabs` variantą ir pritaikyti Settings bei Finance.
- Suvienodinti kortelių, būsenų, toolbar, loading, empty, error ir read-only pateikimą.
- Ikonų mygtukams pridėti aiškius accessible pavadinimus ir tooltip, kur jų trūksta.

### 4. Puslapių sutvarkymas
- **Dashboard:** pilnas plotis, aiškūs Needs attention → Numbers → Quick actions blokai.
- **Projects:** page header, skaičių blokas, vienas search/filter/count toolbar, semantiniai statusai, aiškios empty/error/read-only būsenos; išlaikyti projekto korteles ir esamus dialogus.
- **Finance:** bendri tabai, vienodi toolbar ir lentelių paviršiai, semantinės būsenos; išlaikyti visus 5 esamus tabus bei skaičiavimus.
- **Analytics:** semantinės kortelės ir tekstai, tvarkingas filtrų regionas, loading/error/empty būsenos; esami skaičiavimai nesikeičia.
- **Users:** pilnas plotis, standartinis header ir lentelė, aiškus read-only paaiškinimas.
- **Settings:** pilnas plotis, tabas **Business & appearance**, standartinė forma, matoma dirty/saving/saved būsena ir apsauga nuo neišsaugoto išėjimo.

## Sąmoningos Deerva išimtys

- Nekuriami Inquiries, Articles, Testimonials, maintenance ir viešo turinio CMS, nes šiame vidiniame Deerva projekte jie sąmoningai atidėti.
- Finance lieka vienu punktu Manage grupėje.
- Deerva developer rolė ir jos apsauga neliečiama.
- Viešas vieno puslapio deerva.com dizainas neliečiamas.

## Patikra

- Patikrinti visus admin puslapius prisijungus.
- Patikrinti desktop, tablet ir phone dydžius: sidebar/drawer, antraštes, tabus, lenteles, korteles ir dialogus.
- Patikrinti keyboard focus, pointer/not-allowed būsenas, tabų kontrastą ir horizontalų overflow.
- Paleisti tikslinę TypeScript patikrą ir aktualius testus.
- Patikrinti, kad admin kode neliktų draudžiamų spalvų aliasų ar hardcoded status spalvų.
