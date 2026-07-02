# Business Intake Storage Design

Technicky navrh pro bezpecne ukladani dat z formulare `landing-site/intake.html`.
Tento dokument neni implementace. Nepridava backend, migraci, skript ani napojeni
na Supabase.

## 1. Cil navrhu

Cilem je navrhnout minimalni a bezpecny zpusob, jak ulozit zajem podniku,
kuchare, stanku, male kuchyne nebo food trucku o zapojeni do Mam hlad.

Navrh musi drzet tyto principy:

- Data z formulare jsou soukromy lead, ne verejny profil.
- Nic se nesmi zverejnit bez vyslovneho schvaleni podniku.
- Kontakt je citlivy udaj a nesmi byt verejne dostupny.
- Formular ma zustat jednoduchy, lidsky a bez zbytecne administrativy.
- Backend ma byt minimalni, bezpecny a rozsiritelny pro pozdejsi rucni zpracovani.
- Premium nebo obchodni status nesmi ovlivnit doporucovaci logiku aplikace.

## 2. Co se ma ukladat

Prvni verze uloziste by mela vychazet z aktualniho statickeho formulare
`landing-site/intake.html`. Pole maji byt dostatecna pro rucni posouzeni a
pripravu pracovniho navrhu profilu, ale ne pro automaticke zverejneni.

Navrhovana pole:

| Pole | Zdroj ve formulari | Ucel |
| --- | --- | --- |
| `business_name` | Nazev podniku / kuchyne | Identifikace podniku, kuchyne nebo projektu. |
| `contact_person` | Jmeno kuchare nebo kontaktni osoby | Osoba, se kterou se bude Mam hlad domlouvat. |
| `contact` | Kontakt | E-mail, telefon, Instagram nebo WhatsApp. Citlivy udaj. |
| `business_type` | Typ provozu | Restaurace, bistro, stanek, mala kuchyne, samostatny kuchar nebo jine. |
| `city_area` | Mesto / oblast | Zakladni misto pusobeni. |
| `address_or_location` | Adresa nebo misto prodeje | Presnejsi misto prodeje, pokud ho podnik zna. |
| `opening_or_cooking_times` | Kdy mate otevreno / kdy varite | Orientacni dostupnost, musi se pozdeji overit. |
| `food_description` | Co varite nebo prodavate? | Volny popis nabidky. |
| `recommended_item` | Jidlo, ktere byste doporucili novemu zakaznikovi | Kandidat na hlavni doporucovane jidlo. |
| `best_for` | Kdo si u vas nejvic pochutna? | Kontext pro mistni, turisty, rodiny, studenty nebo pracovni obed. |
| `links` | Web / Instagram / menu | Verejne odkazy nebo kontaktni kanaly, ktere podnik sam poskytl. |
| `supporting_materials` | Fotky nebo jine podklady | Odkazy nebo popis podkladu. Soubory by se mely resit az v dalsi fazi. |
| `note` | Poznamka | Dalsi kontext od podniku. |
| `consent_to_contact` | Souhlas checkbox | Souhlas, ze se Mam hlad muze ozvat a pripravit pracovni navrh profilu. |
| `status` | Interni stav leadu | Rucni stav zpracovani leadu. |
| `created_at` | Systemove pole | Datum vytvoreni zaznamu. |
| `updated_at` | Systemove pole | Datum posledni upravy zaznamu. |

Vsechny verejne profilove udaje musi pred publikaci projit lidskou kontrolou a
schvalenim podniku. AI nebo automatizace mohou pozdeji pomahat s navrhem textu,
ale nesmi vymyslet adresu, kontakt, oteviraci dobu, fotky, recenze, reference,
alergeny ani zdravotni tvrzeni.

## 3. Co se nesmi ukladat zbytecne

Prvni verze nema sbirat data, ktera nejsou nutna pro prijeti a rucni zpracovani
zajmu.

Zatim nesbirat:

- zadne ucty uzivatelu,
- zadne heslo ani prihlasovaci udaje podniku,
- zadne tracking nebo analytics identifikatory,
- zadne zbytecne osobni udaje,
- zadne platebni udaje,
- zadne udaje o objednavkach,
- zadna presna poloha navstevnika formulare,
- zadne automaticke zverejneni profilu,
- zadnou verejnou publikaci dat hned po odeslani formulare.

Pokud podnik posle citlive informace v poznamce, musi byt zachazeni stejne
opatrne jako s kontaktem. Data maji byt dostupna jen lidem nebo serverovym
procesum, ktere je opravdu potrebuji pro zpracovani leadu.

## 4. Navrh Supabase struktury

Navrhovana tabulka:

```text
business_intake_submissions
```

Vychozi stav kazdeho zaznamu musi byt soukromy. Odeslani formulare nesmi samo
vytvorit verejny profil.

### Sloupce

| Sloupec | Typ | Vychozi hodnota | Ucel |
| --- | --- | --- | --- |
| `id` | `uuid` | `gen_random_uuid()` | Stabilni identifikator leadu. |
| `created_at` | `timestamptz` | `now()` | Cas prvniho ulozeni. |
| `updated_at` | `timestamptz` | `now()` | Cas posledni upravy, aktualizovany triggerem nebo serverem. |
| `status` | `text` nebo enum | `new` | Interni stav zpracovani leadu. |
| `business_name` | `text` | `null` | Nazev podniku nebo kuchyne. |
| `contact_person` | `text` | `null` | Kontaktni osoba nebo kuchar. |
| `contact` | `text` | `null` | Kontaktni udaj. Citlive, nikdy verejne bez dalsiho schvaleni. |
| `business_type` | `text` | `null` | Typ provozu podle formulare. |
| `city_area` | `text` | `null` | Mesto nebo oblast. |
| `address_or_location` | `text` | `null` | Adresa nebo misto prodeje. |
| `opening_or_cooking_times` | `text` | `null` | Cas otevreni nebo vareni, pred publikaci overit. |
| `food_description` | `text` | `null` | Popis nabidky. |
| `recommended_item` | `text` | `null` | Jidlo doporucene podnikem. |
| `best_for` | `text` | `null` | Pro koho je podnik nebo jidlo vhodne. |
| `links` | `text` nebo `jsonb` | `null` | Web, Instagram, menu nebo jine odkazy. |
| `supporting_materials` | `text` nebo `jsonb` | `null` | Odkazy nebo popis fotek a podkladu. |
| `note` | `text` | `null` | Volna poznamka. |
| `consent_to_contact` | `boolean` | `false` | Souhlas s kontaktovanim a pripravenim pracovniho navrhu profilu. |
| `source` | `text` | `landing_intake` | Zdroj leadu pro audit a pozdejsi zpracovani. |
| `internal_notes` | `text` | `null` | Interni poznamky Mam hlad, nikdy verejne. |
| `profile_publication_status` | `text` nebo enum | `private_lead` | Oddeleni soukromeho leadu od verejneho profilu. |

### Interni status leadu

Navrhovane hodnoty `status`:

- `new` - novy lead, zatim nezpracovany.
- `contacted` - Mam hlad uz podnik kontaktoval.
- `needs_more_info` - chybi informace pro soukromy navrh profilu.
- `draft_prepared` - existuje pracovni navrh profilu, stale neverejny.
- `approved` - podnik schvalil dalsi krok nebo verejnou podobu podle procesu.
- `rejected` - lead neni vhodny nebo podnik nechce pokracovat.
- `archived` - lead je uzavreny bez aktivniho zpracovani.

### Stav publikace profilu

Navrhovane hodnoty `profile_publication_status`:

- `private_lead` - vychozi stav po odeslani formulare.
- `draft_only` - existuje soukromy pracovni navrh.
- `approved_for_publication` - podnik vyslovne schvalil publikaci.
- `published` - verejny profil byl publikovan rucne nebo schvalenym procesem.

Dulezite: `status = approved` samo o sobe nestaci k publikaci. Verejne zobrazeni
musi byt vazane na samostatny a jasne auditovatelny publikacni stav.

## 5. Bezpecnostni pravidla

Prvni bezpecnostni model ma pocitat s tim, ze landing-site je verejna a formular
mohou odeslat i spammeri.

Navrhovana pravidla:

- Public insert muze byt povolen jen pro vytvoreni noveho leadu.
- Public insert musi nastavovat `status = new` a `profile_publication_status = private_lead`.
- Public select nesmi byt povolen.
- Public update nesmi byt povolen.
- Public delete nesmi byt povolen.
- Cteni a sprava leadu ma byt jen pres admin/server/service role v budoucnu.
- Kontakt, interni poznamky a surova submission data nesmi byt verejne dostupne.
- RLS musi zabranit nahodnemu cteni leadu z klienta.
- Service role key nesmi byt nikdy ve frontend kodu, landing-site ani repozitari.
- Pokud se pouzije Supabase primo z landing-site, musi byt povolena pouze striktne
  omezena operace insert a nic dalsiho.
- Lepsi dlouhodoba varianta je serverless endpoint, ktery validuje vstup, omezi
  spam a teprve potom ulozi soukromy lead.

RLS koncept:

```text
business_intake_submissions:
- anon: insert only, constrained by policy and allowed columns
- anon: no select/update/delete
- authenticated public users: no access by default
- service role/admin: full access for internal processing
```

V prvni implementaci je potreba davat pozor na to, aby validace nebyla jen na
frontend strane. Frontend validace zlepsuje UX, ale bezpecnost musi vynutit
server, Supabase policy nebo serverless endpoint.

## 6. Resumable flow - ulozit a dokoncit pozdeji

Formular obsahuje akci "Ulozit a dokoncit pozdeji". Ta se da resit postupne.

### Varianta A: jednoducha MVP varianta

Rozepsany formular se ulozi lokalne v prohlizeci, napriklad do `localStorage`.
Data se neposilaji na server, dokud uzivatel nezvoli finalni odeslani.

Vyhody:

- jednoduche na implementaci,
- bez backendu,
- nevznika dalsi citlive serverove uloziste pro nedokoncene formulare,
- dobre odpovida staticke landing-site.

Nevyhody:

- rozepsany formular se neprenese mezi zarizenimi,
- data muze ztratit smazani prohlizece nebo anonymni rezim,
- neni vhodne pro dlouhodobe uchovani.

### Varianta B: bezpecnejsi pozdejsi varianta

Po prvnim ulozeni vznikne soukromy draft a nahodny navratovy token. Uzivatel
dostane odkaz, pres ktery se muze vratit k rozepsanemu formulari.

Pravidla:

- token musi byt dlouhy, nahodny a nesnadno uhodnutelny,
- token se uklada pouze hashovany, ne jako cisty text,
- token ma mit expiraci,
- token musi jit zneplatnit,
- draft zustava neverejny,
- token nesmi slouzit k verejnemu cteni cizich dat,
- token nesmi odemykat zadny verejny profil,
- citlive pole se nesmi vracet bez overeni a bez jasneho ucelu.

Vyhody:

- funguje mezi zarizenimi,
- lepsi pro podniky, ktere formular vyplnuji na vicekrat,
- da se navazat na e-mailovy odkaz.

Nevyhody:

- vyzaduje backend nebo serverless endpoint,
- zvysuje bezpecnostni naroky,
- musi se resit expirace, revokace, rate limiting a spam.

### Doporuceni pro prvni implementaci

Pro prvni implementaci doporucuji variantu A: lokalni ulozeni rozepsaneho
formulare v prohlizeci, bez backendu. Je jednoducha, bezpecnejsi pro zacatek a
neotevira tokenovy pristup k soukromym datum pred tim, nez bude schvaleny
serverovy model.

Tokenovou variantu B doporucuji navrhnout az po schvaleni uloziste, RLS pravidel,
retence dat a zpusobu, kdo bude mit k leadum pristup.

## 7. Doporucene faze implementace

Dalsi prace by mela jit po malych PR, aby kazdy krok sel schvalit samostatne.

### PR A - navrh a migrace

- Supabase schema nebo migrace pro `business_intake_submissions`.
- RLS policies pro soukromy lead.
- Zadny submit z formulare.
- Zadna verejna publikace.

### PR B - bezpecne odeslani

- Minimalni submit z `landing-site/intake.html`.
- Validace povinnych poli a souhlasu.
- Ulozeni jako soukromy lead.
- Zadny verejny vystup.
- Zadny service role key ve frontend kodu.

### PR C - potvrzeni uzivateli

- Jednoduchy success state.
- Srozumitelny error state.
- Lidsky ton bez technickeho vysvetlovani.
- Jasne sdeleni, ze profil nepujde ven bez schvaleni.

### PR D - ulozeni a dokonceni pozdeji

- Nejdrive lokalni ulozeni rozepsaneho formulare, pokud bude schvaleno.
- Tokenovy draft az po samostatnem bezpecnostnim rozhodnuti.
- Zadny verejny pristup pres draft token.

### PR E - interni admin / rucni zpracovani

- Zatim jen navrh, ne implementace.
- Definovat, kdo leady vidi.
- Definovat audit zmen a schvaleni publikace.
- Definovat mazani a archivaci.

## 8. Rizika a otevrene otazky

Rizika:

- spam a automaticke submissions,
- falesne submissions jmenem ciziho podniku,
- citlive kontaktni udaje v jednom verejnem formulari,
- GDPR, souhlas a doba uchovani dat,
- mazani dat na zadost,
- nechtene zverejneni dat pred schvalenim,
- AI nebo interni nastroj by mohl omylem doplnit neoverene informace,
- podklady a fotky mohou obsahovat osobni nebo autorska prava.

Otevrene otazky:

- Kdo konkretne bude mit pristup k leadum?
- Jak dlouho se budou neaktivni leady uchovavat?
- Jak bude podnik zadat o vymazani dat?
- Ma se Supabase volat primo z landing-site, nebo pres serverless endpoint?
- Ma landing-site zustat ciste staticka i po prvnim submitu?
- Jak se budou resit fotky a dalsi podklady: jen odkazy, nebo pozdeji upload?
- Ma vznikat e-mailova notifikace pro Mam hlad po odeslani leadu?
- Pokud ano, pres jakou sluzbu a kde budou ulozene klice?
- Jak se bude auditovat vyslovne schvaleni verejneho profilu?
- Kdo smi prepnout `profile_publication_status` na `published`?

## 9. Doporuceni

Jako prvni implementacni PR doporucuji pripravit pouze databazove schema a RLS
pravidla pro soukromou tabulku `business_intake_submissions`. Tento krok by mel
byt bez napojeni formulare a bez verejneho zobrazeni dat.

Zatim nedelat:

- produkcni submit z landing-site,
- draft tokeny,
- upload fotek,
- e-mailove notifikace,
- interni admin,
- verejne profily z intake dat,
- automaticke publikovani,
- prime pouziti service role key ve frontend kodu.

Duvod: nejdriv je potreba schvalit datovy model, soukromi, pristupova prava,
retenci a publikacni branu. Teprve potom ma smysl napojit formular. Zacatek ma
zustat jednoduchy, ale publikace musi byt tezka a vyslovne schvalena.
