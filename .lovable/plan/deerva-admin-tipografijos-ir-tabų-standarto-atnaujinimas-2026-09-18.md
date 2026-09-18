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

### 1. Projekto pagrindinis sans šriftas visoje darbo sąsajoje

- Kiekvienas projektas turi vieną sąmoningai pasirinktą pagrindinį `--font-sans` tokeną.
- Admin dalis, prisijungimo ir slaptažodžio atkūrimo ekranai visada naudoja `--font-sans` tiek antraštėms, tiek tekstui.
- `--font-serif` ir `--font-display` admin bei auth komponentuose draudžiami; globalios viešos antraščių taisyklės turi būti apribotos taip, kad nepatektų į admin.
- Vieša svetainė naudoja tą patį `--font-sans` pagrindiniam tekstui, bet gali turėti papildomą serif/display šriftą išskirtinėms viešoms antraštėms.
- Pakeitus projekto pagrindinį sans šriftą, pakeitimas automatiškai galioja viešam tekstui, admin ir auth ekranams per tą patį tokeną.
- Admin dalis negauna hardcoded `Urbanist`; `Urbanist` lieka Deerva numatytasis pasirinkimas naujam projektui, o esami projektai išlaiko savo sans: OCDG – `Inter`, Lumidenta – `Manrope`, Halliday / StageHomy / Deerva – `Urbanist`.

### 2. Halliday tipo admin tabai

- Vienas bendras `AdminTabs` modelis: horizontali tabų eilė virš plonos `border-border` linijos.
- Aktyvus tabas žymimas aiškiu apatiniu `primary` spalvos pabraukimu ir `text-foreground`; neaktyvūs – `text-muted-foreground`.
- Jokio bendro pilko tabų fono, balto aktyvaus stačiakampio, atskiro kiekvieno tabo rėmelio, pill formos ar uppercase per prievartą.
- Tabų tekstas įprasto registro ir projekto pagrindiniu šriftu; stabilus aukštis, vienodas tarpas, matomas focus žiedas ir pointer.
- Bendras komponentas gali turėti aiškiai pavadintą stipresnį variantą, kai konkretaus prekės ženklo kryptis sąmoningai reikalauja bold uppercase tabų; tai nėra numatytoji būsena.
- Daug tabų telefone pasiekiami horizontaliu slinkimu, nekerpant teksto.
- Tą patį komponentą naudoti Settings, Finance ir kitoms lygiavertėms administravimo subnavigacijoms.

### 3. Ramesni administravimo paviršiai

- Halliday kryptis tampa etalonu: baltas arba projekto `background`, plonos ribos, aiški tipografijos hierarchija ir mažai dekoratyvių užpildų.
- Kortelės lieka tik atskiriems loginiams įrašams ar formos blokams; nekartoti vienodų stačiakampių kiekvienai smulkiai sekcijai.
- Spalvos ir radius vis dar ateina iš konkretaus projekto semantinių tokenų; Halliday hardcoded spalvos nekopijuojamos.

## Kas bus atnaujinta Deerva projekte

1. `docs/standards/01-design-system.md` – aiški pagrindinio `--font-sans` taikymo ir viešo serif/display šrifto atribojimo taisyklė.
2. `docs/standards/02-admin-ui.md` – Halliday linijinių tabų receptas vietoje dabartinio rėminio modelio; patikslinta tipografijos ir paviršių kryptis.
3. `docs/standards/admin-template-prompt.md` ir susijęs audito tekstas – kad kituose projektuose nebebūtų generuojami balti tabų stačiakampiai.
4. Aktyvūs `deerva-design-system` ir `deerva-admin-ui` Skills – tos pačios taisyklės, kad jos būtų automatiškai taikomos naujuose darbuose.
5. Deerva administravimo bendras `AdminTabs` – pakeistas į naują linijinį modelį, kad pats Deerva projektas liktų etaloninis; išlaikoma dabartinė komponento API, keičiama tik išvaizdos anatomija.
6. Patikra: Deerva admin desktop, tablet ir phone; tabų focus, horizontalus slinkimas, kontrastas ir jokių teksto nukirpimų.

## Sąmoninga riba

Šis darbas atnaujins Deerva standartus, Skills ir patį Deerva etaloną. **OCDG projekto kodas šiame žingsnyje nebus keičiamas**; po standarto atnaujinimo OCDG reikės atskiro pritaikymo pagal naują versiją, išlaikant jo verslo logiką ir pasirinktą projekto šriftą.
