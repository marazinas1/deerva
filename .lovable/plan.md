# Deerva finansai: sutartys, faktas ir pelnas

Šiandien yra dvi atskiros vietos: Projects kortelės rodo **sutartas** sumas, o
Finance renka **faktinius** mokėjimus. Jos nesusikalba, todėl nematyti nei kiek
dar liko gauti, nei kiek realiai uždirbta atėmus išlaidas.

Planas jas sujungia į vieną modelį: klientas → projektas → pinigai.

## Modelis

```text
Klientas (Halliday Architects)
   └── žmonės (Chris, Shannon — vienas primary)
   └── projektai (ha.stagehomy.com, ateity daugiau)
          └── sutartys: onboarding 6000 USD, monthly 250 USD
          └── įplaukos (faktas): 3000 USD avansas...
          └── išlaidos: Lovable kreditai, kontraktoriai
```

- **Klientas** – mokantis asmuo ar įmonė. Turi šalį, žmones, statusą.
- **Projektas** – tai, kas jau yra Projects kortelėse. Priskiriamas klientui.
  Vienas klientas gali turėti kelis projektus.
- **Įplauka** – įrašoma tik kai pinigai realiai gauti. Priskiriama projektui,
  papildomai gali nurodyti, ar tai onboarding dalis, ar mėnesinis mokestis.
- **Išlaida** – data, suma, kategorija, tiekėjas, aprašymas. Projektas
  **neprivalomas**: Lovable kreditai per mėnesį lieka bendra išlaida, o
  kontraktoriaus sąskaita gali būti priskirta konkrečiam projektui.

## Ką matysi

### Projekto kortelė
Prie sutartos sumos atsiranda progresas:

```text
Onboarding  US$6,000 sutarta · US$3,000 gauta · US$3,000 liko   [====      ]
Monthly     US$250 · paskutinis mokėjimas 2026-08-01
```

Kortelė taip pat rodo kliento vardą ir, jei yra išlaidų, projekto pelną.

### Finance
Tabai: **Overview · Income · Expenses · Clients · Payment methods**

- **Overview** – Pajamos / Išlaidos / **Pelnas** (didžiausias skaičius), šiemet
  ir iš viso, grafikas pagal mėnesius su pajamų ir išlaidų stulpeliais,
  nesurinkta suma („dar laukiama US$3,000"), filtrai pagal metus ir projektą.
- **Income** – faktiniai mokėjimai, kaip dabar, tik su projekto ir tipo
  (onboarding / monthly / kita) laukais.
- **Expenses** – naujas sąrašas. Kategorijos: Lovable credits, Hosting,
  Domains, Contractor, Tools, Other. Greitas mygtukas „Add monthly Lovable
  credits" su praėjusio mėnesio suma kaip pasiūlymu.
- **Clients** – žmonės ir jų projektai vienoje vietoje, primary kontaktas,
  paieška per vardą, el. paštą, telefoną.

Visi skaičiai vienoje valiutoje (EUR) su USD konvertavimu, kaip dabar. Dabartinis
„Show amounts" principas iš StageHomy: sumos gali būti paslėptos vienu mygtuku.

## Kaip dirbsi kasdien

1. Sutarei projektą → Projects: sukuri kortelę, įrašai sutartas sumas.
2. Gavai pavedimą → Finance → Income → New payment (projektas jau sąraše).
3. Kartą per mėnesį → Finance → Expenses → įrašai Lovable kreditus.
4. Overview parodo pelną, o kortelė – kiek dar liko gauti iš kiekvieno projekto.

## Techninė dalis

- Nauja lentelė `client_accounts` (mokantis klientas) su `is_manager()` RLS,
  GRANT, indeksais, `updated_at` trigeriu. Esama `clients` lentelė lieka
  projektų lentele; jai pridedamas nullable `account_id`. Esamiems trims
  projektams sukuriami atitinkami klientai ir priskiriami – nieko netrinama.
- `client_contacts` gauna nullable `account_id`; kontaktai pakyla į kliento
  lygį, senas `client_id` lieka kaip atsarga.
- `payments` gauna nullable `kind` (`onboarding` / `monthly` / `other`).
- Nauja `expenses` lentelė: data, kategorija, tiekėjas, suma, valiuta, FX,
  `net_eur`, nullable `client_id` (projektas), aprašymas, ta pati RLS.
- Skaičiavimai (gauta / liko, pelnas) – dalinami helperiai `src/lib/finance.ts`;
  nauji hookai `useExpenses`, `useClientAccounts` tame pačiame paginavimo
  modelyje. Jokių edge functions, RLS lieka vienintelė apsauga.
- Migracijos tik struktūrai; esamų projektų priskyrimas klientams – atskiras
  duomenų žingsnis.

## Ko šis planas neliečia

- Sąskaitų faktūrų generavimo PDF – atskiras darbas.
- Automatinio Lovable kreditų traukimo – suma įvedama ranka.
- Nieko viešoje svetainėje; visa tai lieka admin viduje.
