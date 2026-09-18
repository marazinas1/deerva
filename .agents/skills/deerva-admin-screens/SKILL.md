---
name: deerva-admin-screens
description: Naudok kuriant Deerva admin sąrašų ir redagavimo ekranų workflow — collection, expandable editors, page content, media slots, publication, defaults, inquiries ir save elgesį. Vizualui naudok deerva-admin-ui.
---

# 02B — Admin ekranų modeliai

Šis skill atsako **iš ko sudarytas ekranas ir kaip jis elgiasi**.

## Collection

```text
Page header: title + sakinys + primary create
Toolbar: search + realūs filters + count
Collection: table, card grid arba expandable rows
Pagination / load-more
Loading / empty / error / read-only
```

Table — palyginimui; card grid — kai vaizdas esminis; expandable rows — dažnam ilgo įrašo redagavimui. Nedubliuoti navigacijos: puslapio turinys Settings, repeatable records Manage.

## Expandable editor

Testimonials yra etalonas ir gali būti taikomas Articles, Services, FAQ.

- Collapsed: title/name, published state, order, short summary.
- Inline edit; default vienas atvertas.
- Ilgam sąrašui „Expand all / Collapse all“.
- Aiškus „Shown on site“ switch.
- Save toast; dirty warning prieš uždarant/naviguojant.
- Delete confirm įvardija record ir ką pašalins iš svetainės.

## Kur redaguoti

Inline expansion — dažnai redaguojamai repeatable esybei. Dialog/sheet — trumpam create ar secondary task. Dedicated route — sudėtingam record su sub-sections/history/deep links. Ilgos multi-section formos nekišti į mažą modal.

## Page-content tabas

Tabo pavadinimas tiksliai atkartoja public menu label: `Home`, ne `Home texts`; `Gallery`, ne `Gallery content`. Tabas yra viso puslapio editorius, ne text-only forma.

Laukai eina tokia tvarka kaip renderinamas viešas puslapis. Kiekviena matoma eilutė turi text field, kiekvienas keičiamas vaizdas — media slot ir alt. Tuščia DB nepalieka broken page, nes komponentas turi fallback. Naujas public route + Settings tabas kuriami kartu.

## Defaults workflow

Owner/editor keičia client-owned content pagal teises. Owner pateikia „Set as default“ request. Dashboard Needs attention rodo project/page/slot/preview. Tik developeris keičia pinned defaults. Approve/reject turi matomą rezultatą.

## Media slot

Label + rekomenduojamas formatas; current truthful preview; alt; replace; remove/reset; progress/error. Upload per shared optimization. Replace/remove valo seną client-owned objektą. Reset pašalina override ir atidengia default.

## Order ir publication

Jei tvarka svarbi, duoti stable order control arba patikrintą drag-and-drop ir išsaugoti galutinę tvarką. Published/visible yra aiškus labelled switch. Hidden lieka editable ir pažymėtas.

## Inquiries

Newest first; unread, identity, time, source/page, workflow status. Atidarymas žymi read tik jei pasekmė aiški. Contact/reply atskirai nuo status. Dashboard linkina tiesiai į unread/pending filter.

## Dashboard ir Settings save

Dashboard: Needs attention → Numbers → Quick actions; analytics detalės lieka Analytics.

Business & appearance gali turėti coordinated save. Kiekvienas page tabas saugomas atskirai. Save plotis nekinta loading metu, rodo toast. Dirty state matoma ir saugoma nuo browser bei client navigation. Validation išlaiko reikšmes ir parodo pirmą klaidą.

## Permission-aware UI

Security vykdo serveris/RLS. UI atspindi teises: developer viskas + defaults queue; owner business/content/users + request-default; editor tik leistas content, be destructive/settings/users, nebent Team-tier matrix aiškiai suteikia. Kai veiksmas negalimas, rodyti trumpą read-only paaiškinimą.
