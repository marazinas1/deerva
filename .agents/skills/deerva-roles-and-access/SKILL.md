---
name: "deerva-roles-and-access"
description: "Naudok, kai diegi, tikrini ar migruoji vartotojų roles ir teises bet kuriame Deerva projekte — renkantis tarp Solo trijų rolių modelio ir Team permission-matricos, arba dirbant su Users puslapiu ir invite srautu."
---

# 03 — Rolės ir prieiga

Vienoda kiekviename Deerva projekte, su viena išimtimi žemiau (Two tiers).

## Trys rolės


| Rolė        | Kas                               | Gali                                                                               |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `developer` | Marius (`rutkusmarius@gmail.com`) | viską, visada, kiekviename projekte                                                |
| `owner`     | klientas                          | visą turinį, visus nustatymus, kviesti ir valdyti editor'ius                       |
| `editor`    | kliento personalas                | redaguoti turinį; negali trinti, negali keisti nustatymų, negali valdyti vartotojų |


Lygiai **viena rolė vienam vartotojui**. Be dubliavimo.

## Dvi pakopos — renkiesi vieną, nemaišai

**Solo tier (numatytasis)** — vienas savininkas, be personalo. Naudok
aukščiau aprašytą trijų rolių modelį: `developer` / `owner` / `editor`, po
vieną rolę vartotojui, per `user_roles` lentelę ir funkcijas
`has_role` / `is_developer` / `is_manager` / `is_admin_staff`.

**Team tier** — klientas turi personalą, kuriam reikia skirtingo matomumo
(pvz. agentas mato tik savo skelbimus, o vadovas — visų). Naudok
`permissions` + `role_permissions` matricą su detaliais raktais
(`resource.action.own` / `resource.action.any`) vietoj trijų rolių enum.
`developer` lieka hardcoded ir identiškas abiem atvejais.

Niekada neįdiek trijų rolių enum į Team-tier projektą „standartizavimo"
vardan — detali matrica atlieka darbą, kurio enum negali. Niekada neįdiek
permission matricos į Solo-tier projektą — tai nereikalingas sudėtingumas
vienam savininkui.

## Neliečiami dalykai

1. Rolės gyvena atskiroje `user_roles` lentelėje. Niekada kaip stulpelis
  `profiles` ar `users` lentelėje — tai privilegijų eskalavimo skylė.
2. Tikrinimai eina per `SECURITY DEFINER` funkcijas: `has_role`,
  `is_developer`, `is_manager`, `is_admin_staff`. RLS politikos kviečia
   jas, niekada tiesiogiai neužklausia `user_roles`.
3. `developer_email()` yra hardcoded į `rutkusmarius@gmail.com`. Vartotojas
  su tuo el. paštu automatiškai gauna `developer` rolę per trigerį,
   registruojantis.
4. Developer eilučių niekas negali keisti ar trinti, išskyrus developerį.
  Užtikrinama `BEFORE` trigeriu, ne per UI.
5. Niekas negali pakeisti savo pačio rolės.
6. Bent vienas owner visada turi likti. Paskutinio owner negalima
  pažeminti ar pašalinti.
7. Jokios viešos registracijos. Prieiga tik per pakvietimą.

## Users puslapis

Rodo kiekvienai paskyrai: vardą, el. paštą, rolės žymę, „you" žymę
dabartiniam vartotojui, sukūrimo datą, **paskutinio prisijungimo laiką**.
Developer eilutės pažymėtos kaip apsaugotos, be valdiklių.

Kvietimo forma: el. paštas, neprivalomas vardas, rolės pasirinkimas
(tik owner/editor), kvietimo mygtukas.

Paskutinio prisijungimo stulpelis nėra puošmena — tai būdas iš vienos
vietos stebėti kiekvieno kliento verslo sveikatą.

## Auth srautas

- Prisijungimas `/admin/login`, padalintas išdėstymas: forma kairėje,
brand panelė dešinėje, logo veda į pradžią.
- Pakvietimo ir atkūrimo nuorodos veda į `/admin/set-password`.
- Auth laiškai siunčiami iš paties projekto domeno, niekada iš platformos
numatytojo adreso.
- Apsaugoti maršrutai gyvena po `_authenticated/`; maršruto vartai yra
vienintelis auth patikrinimas. Jokių `useEffect` peradresavimų
atskiruose puslapiuose.