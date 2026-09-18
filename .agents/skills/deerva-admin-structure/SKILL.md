---
name: deerva-admin-structure
description: Naudok kuriant ar pertvarkant Deerva kliento admin informacijos architektūrą — sidebar grupes, Settings tabų seką, Business & appearance, maintenance ir Dashboard. Vizualui naudok deerva-admin-ui, ekranų elgesiui deerva-admin-screens.
---

# 02 — Admin struktūra

Šis skill atsako **kas egzistuoja ir kur**. Admin yra produktas; jei klientą reikia mokyti atlikti dažną veiksmą, jis nebaigtas.

## Sidebar — tik trys grupės

```text
WORKSPACE
  Dashboard
  Inquiries
  Calendar       jei sektoriui reikia
  Messages       tik jei sektoriui reikia ir nėra Calendar
  Analytics

MANAGE
  <kartojama esybė>
  <kiti sektoriaus valdymo punktai>
  Articles
  Testimonials

SETTINGS
  Users
  Settings
```

Workspace ir Settings vienodi visuose klientų projektuose; kinta tik Manage. Calendar ir Messages kartu nerodomi be realaus poreikio. Articles ir Testimonials yra numatyti visur. Deerva vidinis control room gali turėti dokumentuotų sektoriaus išimčių.

Sidebar apačia: vartotojo el. paštas, rolė small caps, „Back to site“, „Sign out“.

## Settings tabai

1. **Business & appearance** — business identity, adresas, map, telefonas, el. paštas, socialai, licencijos, logo, vienas logo dydis, favicon ir maintenance.
2. **Home** ir visi kiti pagrindinio viešo meniu puslapiai ta pačia tvarka.
3. **Contact** — visada paskutinis.

Legal/shared turinys eina prieš Contact arba aiškiame shared bloke. Naujas viešas puslapis ir jo Settings tabas sukuriami kartu. Kiekvienas puslapio tabas redaguoja tekstus ir nuotraukas.

Nedubliuoti tų pačių page-text nuorodų atskiroje sidebar Content grupėje: kartojamos esybės eina į Manage, puslapių tekstai/media — tik į Settings.

## Business & appearance ir maintenance

Vienas `site_settings` šaltinis valdo duomenis visoje svetainėje, footer, Contact, map, schema.org, login ir admin. Logo visur tas pats ir to paties nustatyto dydžio; favicon kildinamas iš to paties ženklo.

Maintenance yra suskleidžiamas blokas pirmo tabo apačioje, ne atskiras tabas. Neprisijungęs lankytojas mato brand'inį holding page su realiu telefonu ir el. paštu. Prisijungęs personalas mato svetainę su nuolatine juosta ir „Preview as visitor“ / „Turn off“. Kol auth tikrinama, rodyti mažiau: holding page.

## Admin plotis

Visi admin puslapiai naudoja visą turinio srities plotį. Plotį riboja tik bendras shell paddingas `px-4 py-6 md:px-6 md:py-8`.

- Root: `w-full` + vienodas vertical spacing; jokių `max-w-*` ar `mx-auto` salų.
- Sąrašai, lentelės, formos ir gridai tempiasi per visą plotį; tankis valdomas grid stulpeliais.
- `max-w-*` tik dialogs/sheets, public preview ir pavieniam absurdiškai trumpam laukui.
- Page header: kairėje h1 + vienas sakinys, dešinėje iki vieno primary veiksmo.

## Dashboard

1. Needs attention — neperskaityta ir laukiama; aiški empty state.
2. Numbers — 7 dienų lankomumas, sektoriaus esybės ir savaitiniai skaičiai.
3. Quick actions — 2–4 dažniausi veiksmai.

## Defaults ir elgesys

Owner prašo „Set as default“, developeris patvirtina; klientas tiesiogiai nerašo developerio defaults.

Kiekvienas sąrašas turi konkretų empty tekstą. Destructive veiksmas įvardija praradimą ir prašo patvirtinti. Save rodo toast, dirty būsena įspėja prieš išeinant. Editor mato read-only paaiškinimą. Security užtikrina serveris/RLS, ne paslėptas mygtukas.
