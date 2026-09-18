# Deerva admin tipografijos ir tabų standarto atnaujinimas

## Tikslas

Pakeisti bendrą Deerva admin vaizdo taisyklę taip, kad projektai išliktų vientisi su savo vieša svetaine, o Settings ir kiti administravimo tabai būtų lengvi, šiuolaikiški ir paremti patikusiu Halliday Architects pavyzdžiu.

## Patikrinta dabartinė situacija

- **Halliday Architects** visoje svetainėje ir admin dalyje naudoja `Urbanist` (300–800). Settings tabai yra lengva horizontali navigacija su apatine skiriamąja linija ir aktyvaus tabo pabraukimu.
- **StageHomy** taip pat visoje svetainėje ir admin dalyje naudoja `Urbanist`.
- **OCDG** viešoje svetainėje ir admin dalyje naudoja `Inter`, todėl administravimo tipografija natūraliai atrodo kitaip nei Halliday ir StageHomy.
- Dabartiniai OCDG Settings tabai buvo sukurti pagal esamą Deerva taisyklę: pilką rėminį konteinerį, baltą aktyvaus tabo stačiakampį, uppercase tekstą ir pilną aktyvaus tabo paviršių.
- Dabartinis `deerva-admin-ui` standartas tiesiogiai reikalauja rėminio tabų konteinerio ir draudžia vien pabraukimą, todėl OCDG rezultatas atitinka parašytą taisyklę, bet neatitinka pasirinktos estetikos.

## Naujos taisyklės

### 1. Viena projekto tipografija visur

- Kiekvienas projektas turi vieną sąmoningai pasirinktą pagrindinę šriftų šeimą.
- Ta pati šeima naudojama viešoje svetainėje, admin dalyje ir prisijungimo / slaptažodžio atkūrimo ekranuose.
- Pakeitus projekto pagrindinį šriftą, pakeitimas turi galioti visoms šioms sritims per bendrą semantinį font tokeną.
- Admin dalis negauna atskiro privalomo `Urbanist`, tačiau `Urbanist` lieka Deerva numatytasis pasirinkimas naujam projektui.
- Vieša svetainė gali turėti papildomą display/serif šriftą išskirtinėms antraštėms, bet admin darbo sąsaja naudoja pagrindinį sans šriftą, kad išliktų aiški ir nuosekli.

### 2. Halliday tipo admin tabai

- Vienas bendras `AdminTabs` modelis: horizontali tabų eilė virš plonos `border-border` linijos.
- Aktyvus tabas žymimas aiškiu apatiniu `primary` spalvos pabraukimu ir `text-foreground`; neaktyvūs – `text-muted-foreground`.
- Jokio bendro pilko tabų fono, balto aktyvaus stačiakampio, atskiro kiekvieno tabo rėmelio, pill formos ar uppercase per prievartą.
- Tabų tekstas įprasto registro ir projekto pagrindiniu šriftu; stabilus aukštis, vienodas tarpas, matomas focus žiedas ir pointer.
- Daug tabų telefone pasiekiami horizontaliu slinkimu, nekerpant teksto.
- Tą patį komponentą naudoti Settings, Finance ir kitoms lygiavertėms administravimo subnavigacijoms.

### 3. Ramesni administravimo paviršiai

- Halliday kryptis tampa etalonu: baltas arba projekto `background`, plonos ribos, aiški tipografijos hierarchija ir mažai dekoratyvių užpildų.
- Kortelės lieka tik atskiriems loginiams įrašams ar formos blokams; nekartoti vienodų stačiakampių kiekvienai smulkiai sekcijai.
- Spalvos ir radius vis dar ateina iš konkretaus projekto semantinių tokenų; Halliday hardcoded spalvos nekopijuojamos.

## Kas bus atnaujinta Deerva projekte

1. `docs/standards/01-design-system.md` – aiški vienos projekto šriftų šeimos taisyklė viešai svetainei, admin ir auth ekranams.
2. `docs/standards/02-admin-ui.md` – Halliday linijinių tabų receptas vietoje dabartinio rėminio modelio; patikslinta tipografijos ir paviršių kryptis.
3. `docs/standards/admin-template-prompt.md` ir susijęs audito tekstas – kad kituose projektuose nebebūtų generuojami balti tabų stačiakampiai.
4. Aktyvūs `deerva-design-system` ir `deerva-admin-ui` Skills – tos pačios taisyklės, kad jos būtų automatiškai taikomos naujuose darbuose.
5. Deerva administravimo bendras `AdminTabs` – pakeistas į naują linijinį modelį, kad pats Deerva projektas liktų etaloninis.
6. Patikra: Deerva admin desktop, tablet ir phone; tabų focus, horizontalus slinkimas, kontrastas ir jokių teksto nukirpimų.

## Sąmoninga riba

Šis darbas atnaujins Deerva standartus, Skills ir patį Deerva etaloną. **OCDG projekto kodas šiame žingsnyje nebus keičiamas**; po standarto atnaujinimo OCDG reikės atskiro pritaikymo pagal naują versiją, išlaikant jo verslo logiką ir pasirinktą projekto šriftą.
