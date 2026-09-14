# Planas: sukurti du Deerva workspace skills

## Tikslas
Iš `docs/standards/02-admin-structure.md` ir `docs/standards/03-roles-and-access.md` sukurti du aktyvius workspace skills, kuriuos vėliau galima iškviesti per Settings → Skills arba `/` komandą bet kuriame Deerva projekte.

## Žingsniai

1. **Nuskaityti šaltinius**
   - Patikrinti `docs/standards/02-admin-structure.md` ir `docs/standards/03-roles-and-access.md` turinį.
   - Įsitikinti, kad abu failai yra švieži ir neturi papildomų pataisymų, kuriuos reikėtų įtraukti.

2. **Sukurti skill draftus**
   - `.agents/skills/deerva-admin-structure/SKILL.md`
     - `name`: `deerva-admin-structure`
     - `description` (lietuviškai): pateiktas aprašymas.
     - `content`: visas `02-admin-structure.md` turinys angliškai.
   - `.agents/skills/deerva-roles-and-access/SKILL.md`
     - `name`: `deerva-roles-and-access`
     - `description` (lietuviškai): pateiktas aprašymas.
     - `content`: visas pataisytas `03-roles-and-access.md` turinys (su „Two tiers“ skyriumi).

3. **Pritaikyti skills**
   - Paleisti `skills--apply_draft` su kiekvienu skill root directory:
     - `.agents/skills/deerva-admin-structure`
     - `.agents/skills/deerva-roles-and-access`
   - Patikrinti, kad apply operacija sugrįžta be klaidų.

4. **Patikrinti aktyvumą**
   - Įsitikinti, kad abu skills atsiranda workspace skills sąraše (Settings → Skills).
   - Trumpai patikrinti, ar skill aprašymas ir content atvaizduojamas teisingai.

## Kas nepatenka į šį planą
- Skill turinio vertimas į lietuvių kalbą — paliekamas atskirai pagal pageidavimą.
- Trečiųjų standartų (pvz., design-system, analytics) konvertavimas į skills.
- Bet kokie kodo ar admin pakeitimai projekte.

## Po patvirtinimo
Patvirtinus planą sukursiu draft skill failus ir pritaikysiu juos, kad jie taptų prieinami workspace lygmeniu.
