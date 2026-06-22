# Business intake data contract

Tento dokument popisuje budoucí datový kontrakt pro příjem informací od podniků a lidí, kteří chtějí být v Mám hlad. Platí pro restaurace, street-food prodejce, malé kuchyně, pop-upy, farmářské stánky i jednotlivé kuchaře.

Kontrakt je navržený pro české i mezinárodní podniky a pro profil, který má být srozumitelný místním i turistům.

## Základní principy

- AI připravuje návrh, člověk ověřuje a podnik schvaluje.
- Žádný profil podniku se nezveřejní bez výslovného schválení podniku.
- Mlčení není souhlas.
- AI nesmí vymýšlet fakta, jména, reference, recenze, fotky, otevírací dobu, alergeny ani zdravotní tvrzení.
- Prémiový status nesmí ovlivnit recommendation engine ani pořadí doporučení.
- Citlivé informace se používají jen pro přípravu profilu, ověření a kontakt s podnikem.
- Data musí fungovat i tam, kde podnik nemá klasickou provozovnu, web nebo pevnou otevírací dobu.

## Podporované typy subjektů

Každý intake záznam musí umět zachytit jeden z těchto typů:

- `restaurant` - restaurace, bistro, kavárna, bar s jídlem.
- `street_food` - stánek, food truck, festivalový prodejce, trh.
- `small_kitchen` - malá kuchyně, catering, domácí výroba s legálním provozem.
- `individual_cook` - jednotlivý kuchař, šéfkuchař, hostující kuchař, pop-up kuchař.
- `other` - jiný typ, který musí člověk ručně posoudit.

Pokud typ není jasný, AI smí navrhnout kategorii, ale musí ji označit k lidskému ověření.

## Povinná pole

Bez těchto polí nelze připravit ani neveřejný návrh profilu:

| Pole | Typ | Poznámka |
|---|---|---|
| `business_name` | string | Název podniku nebo veřejně používané jméno kuchaře. |
| `business_type` | enum | Jeden z podporovaných typů subjektů. |
| `country` | string | Země provozu nebo primární země působení. |
| `city_or_area` | string | Město, čtvrť, trh, region nebo oblast působení. |
| `contact_person_name` | string | Osoba, která může schválit profil nebo dodat podklady. |
| `contact_channel` | string | E-mail, telefon nebo jiný schválený kontakt. |
| `source_channel` | enum | `form`, `voice`, `email`, `manual`, `other`. |
| `approval_status` | enum | Výchozí stav musí být `draft` nebo `pending_business_approval`. |
| `submitted_at` | ISO date | Kdy byl intake přijat. |
| `locale_primary` | string | Primární jazyk vstupu, např. `cs-CZ`, `en-US`, `de-DE`. |

## Volitelná pole

Volitelná pole pomáhají vytvořit lepší profil, ale nesmí blokovat intake:

| Pole | Typ | Poznámka |
|---|---|---|
| `address` | string | Pevná adresa, pokud existuje. |
| `geo_hint` | string | Neformální poloha: trh, ulice, festival, parkoviště, okolí. |
| `website_url` | string | Web nebo stránka podniku. |
| `social_links` | array | Instagram, Facebook, TikTok, Mapy, Google profil. |
| `cuisine_tags` | array | Např. česká, vietnamská, mexická, vegan, barbecue. |
| `signature_dishes` | array | Konkrétní jídla, která podnik sám doporučuje. |
| `chef_recommendation` | string | Doporučení kuchaře nebo obsluhy. |
| `short_story` | string | Krátký příběh místa nebo člověka. |
| `price_notes` | string | Orientační cenová hladina, ne garantovaný ceník. |
| `opening_hours_text` | string | Otevírací doba jako text od podniku. |
| `service_modes` | array | Na místě, s sebou, rozvoz, trh, festival, catering. |
| `tourist_help` | array | Jazyk obsluhy, jednoduché doporučení, platba kartou, blízkost dopravy. |
| `local_context` | string | Proč je místo známé pro místní. |
| `languages_supported` | array | Jazyky, ve kterých podnik umí komunikovat. |
| `photos_provided` | array | Fotky dodané podnikem nebo schváleným zdrojem. |
| `accessibility_notes` | string | Praktické poznámky k přístupu, pokud je podnik dodá. |
| `dietary_notes` | string | Orientační informace dodané podnikem. |

## Pole k lidskému ověření

Tato pole musí být označena jako `needs_human_verification`, pokud nejsou přímo potvrzená podnikem nebo důvěryhodným zdrojem:

- Název a právní vztah k provozu, pokud se liší značka a osoba.
- Adresa, poloha, trasa na trh nebo festivalové místo.
- Otevírací doba, sezónnost a výjimky.
- Aktuální nabídka jídel a dostupnost konkrétních položek.
- Ceny, velikosti porcí a promo akce.
- Alergeny, dietní informace a složení jídel.
- Zdravotní tvrzení a tvrzení o vhodnosti pro konkrétní diagnózu nebo dietu.
- Fotky, autorství fotek a souhlas s použitím.
- Reference, citace, hodnocení hostů a recenze.
- Ocenění, mediální zmínky a tvrzení typu "nejlepší", "tradiční", "originální".
- Jazyky obsluhy a informace pro turisty.
- Platební možnosti, rezervace, rozvoz a kapacita.

## Pole, která AI nesmí nikdy vymyslet

AI nesmí doplnit jako fakt nic z tohoto seznamu:

- Otevírací dobu.
- Adresu nebo přesnou polohu.
- Telefon, e-mail nebo sociální sítě.
- Jména majitelů, kuchařů, obsluhy nebo zaměstnanců.
- Fotky, autorství fotek nebo souhlas s použitím fotek.
- Recenze, reference, citace hostů nebo mediální zmínky.
- Ocenění, certifikace, původ surovin nebo obchodní partnerství.
- Alergeny, bezlepkovost, vhodnost pro celiakii nebo bezpečnost pro alergiky.
- Zdravotní účinky jídla, léčebné účinky nebo dietní vhodnost.
- Ceny, slevy, menu dne nebo dostupnost jídla v konkrétní čas.
- Prémiový status, obchodní podmínky nebo placené výhody.

AI smí navrhnout otázku, kterou má člověk nebo podnik doplnit. Nesmí z otázky udělat tvrzení.

## Souhlas a schvalování

Každý intake záznam musí nést samostatné stavy:

- `data_received` - podklady byly přijaty.
- `draft_created` - AI nebo člověk připravil neveřejný návrh.
- `human_reviewed` - člověk zkontroloval riziková pole.
- `sent_to_business` - návrh byl poslán podniku ke schválení.
- `business_approved` - podnik výslovně schválil publikaci.
- `published` - profil byl zveřejněn.
- `rejected` - podnik nesouhlasí nebo se profil nemá publikovat.

Pravidla:

- Výchozí stav nesmí být `published`.
- Přechod na `published` je možný jen po `business_approved`.
- Souhlas musí být explicitní, dohledatelný a vázaný ke konkrétní verzi profilu.
- Pokud se po schválení změní fakta, fotky, alergeny, dietní informace nebo citace, musí být znovu ověřeny.
- Podnik může požádat o úpravu nebo stažení profilu.
- Osoba, která schvaluje profil, musí mít zjevný vztah k podniku nebo kuchaři.

## Fotky

- Používat lze jen fotky dodané podnikem, pořízené týmem Mám hlad se souhlasem, nebo fotky z jiného zdroje s jasnými právy.
- Žádné fake fotky, stock fotky vydávané za podnik ani AI obrázky vydávané za reálné jídlo.
- U každé fotky musí být známý zdroj a stav souhlasu.
- Fotka konkrétní osoby vyžaduje zvláštní opatrnost a souhlas s použitím.
- Pokud není jisté, že fotku lze použít, nesmí být publikovaná.

## Otevírací doba

- Otevírací doba je proměnlivé pole a musí být označená jako orientační, pokud není potvrzená podnikem.
- U street-food a pop-up provozů musí kontrakt podporovat nepravidelnou dostupnost.
- AI nesmí převzít starou otevírací dobu jako aktuální bez ověření.
- Pokud podnik funguje podle akcí, trhů nebo počasí, profil má raději uvést praktickou poznámku než pevný rozpis.

## Alergeny, diety a zdravotní tvrzení

- Alergeny a dietní informace jsou pouze orientační, pokud je výslovně nepotvrdí podnik.
- Mám hlad negarantuje bezlepkovost, absenci alergenů ani vhodnost pro celiakii.
- AI nesmí z ingrediencí odvozovat bezpečnost pro alergiky.
- AI nesmí tvrdit, že jídlo léčí, zlepšuje zdravotní stav nebo je vhodné pro diagnózu.
- U dietních informací má profil používat opatrný jazyk: "podnik uvádí", "ověřte na místě", "může se měnit".
- Pokud podnik dodá detailní alergeny, patří mezi pole k lidskému ověření a k potvrzení podnikem.

## Recenze a reference

- Recenze a reference se nesmí vymýšlet, parafrázovat jako cizí zkušenost ani připisovat neexistujícím hostům.
- Citaci lze použít jen s jasným zdrojem a souhlasem, pokud nejde o veřejně použitelný zdroj.
- Doporučení od týmu Mám hlad musí být označené jako vlastní redakční nebo produktové doporučení.
- Prémiový vztah nesmí být prezentovaný jako nezávislá reference.
- Pokud existuje komerční vztah, dokumentace profilu ho musí umět interně zaznamenat.

## Turisté a místní

Kontrakt musí umožnit zachytit dvě vrstvy významu:

- Pro místní: proč se sem vracet, co je typické, co je sezónní, kdo za jídlem stojí.
- Pro turisty: co si dát bez znalosti místa, jak se domluvit, kde podnik najít, jak zaplatit, zda je podnik vhodný pro rychlou návštěvu.

AI smí pomoci s překladem a zjednodušením textu pro turisty, ale nesmí měnit význam potvrzený podnikem.

## Mezinárodní podpora

- `locale_primary` určuje jazyk původního vstupu.
- Překlady musí mít vlastní stav ověření.
- Země, měna, adresa a telefon se nesmí normalizovat tak, že se ztratí místní kontext.
- U podniků mimo Česko se nesmí předpokládat české právní, hygienické nebo provozní zvyklosti.
- Pokud AI nerozumí místnímu kontextu, má pole označit k lidskému ověření.

## Premium a recommendation engine

- Prémiový status je obchodní nebo prezentační metadata, ne signál kvality jídla.
- Recommendation engine nesmí číst ani používat premium status.
- Premium nesmí zvyšovat pořadí výsledků, měnit skóre ani potlačovat neplacené podniky.
- Placené prvky mohou ovlivnit jen jasně oddělenou prezentaci, například rozšířený profil, pokud to produkt výslovně zavede a označí.
- Jakákoli budoucí změna v tomto směru musí projít samostatným schválením.

## Minimální interní stav záznamu

Každý záznam by měl interně obsahovat:

| Pole | Účel |
|---|---|
| `record_id` | Stabilní interní identifikátor. |
| `created_at` | Vytvoření záznamu. |
| `updated_at` | Poslední změna. |
| `created_by` | Formulář, hlas, e-mail, člověk nebo migrace. |
| `source_evidence` | Odkazy na vstupní podklady, nahrávku, e-mail nebo poznámky. |
| `verification_notes` | Co je ověřené, co chybí, co je rizikové. |
| `approval_evidence` | Důkaz výslovného schválení konkrétní verze profilu. |
| `publication_status` | Neveřejný návrh, čeká na schválení, publikováno, staženo. |
| `sensitive_fields` | Pole, která vyžadují opatrnost nebo další kontrolu. |

## Minimální pravidlo pro publikaci

Profil lze publikovat jen tehdy, když platí všechny body:

- Podnik nebo oprávněná osoba výslovně schválila konkrétní verzi profilu.
- Nejsou publikovaná neověřená riziková tvrzení.
- Fotky mají jasný zdroj a souhlas.
- Alergeny a dietní informace jsou formulované opatrně a nejsou prezentované jako garance.
- Zdravotní tvrzení nejsou přítomná, pokud nejsou zvlášť právně a lidsky ověřená.
- Premium status nijak nezasahuje do doporučovací logiky.
- Interní poznámky, kontakty a soukromé podklady nejsou veřejně viditelné.
