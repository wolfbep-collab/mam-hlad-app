# Bezpečnost dat o jídle

Tento dokument shrnuje, jak Mám hlad zachází s informacemi o jídle, ingrediencích a alergenech, a kde leží hranice odpovědnosti.

## Co Mám hlad je

Mám hlad je most mezi člověkem, který má hlad, a podnikem / stánkem / kuchařem, který ten hlad umí uspokojit. Aplikace pomáhá vybírat, doporučovat a navigovat — ale není sama o sobě zdrojem pravdy o jídle.

## Kdo zadává data o jídle

Jídla, ingredience, alergenní informace a poznámky kuchaře má **ideálně zadávat podnik**. Aplikace tyto údaje pouze zobrazuje tak, jak je podnik uvedl.

Demo data v aplikaci slouží jen jako příklad zobrazení — neaspirují na klinickou přesnost.

## Co aplikace nedělá

- **Negarantujeme alergeny.** Aplikace sama netvrdí, že jídlo je bez konkrétního alergenu.
- **Negarantujeme vhodnost pro celiaky.** I když je u jídla štítek „Bez lepku podle surovin“, neznamená to, že je jídlo bezpečné pro celiaky.
- **Nedaňáme zdravotní doporučení.** Lehké / zdravé / vegan jsou pomocné štítky pro rozhodování, ne lékařská kategorizace.

Pokud chce uživatel jíst při alergii nebo celiakii, vždy ho odkazujeme na to, aby si informaci ověřil přímo s obsluhou podniku.

## „Bez lepku podle surovin“ vs. „vhodné pro celiaky“

Tyto dvě věci **nejsou totéž**:

- `by_ingredients` = **„Bez lepku podle surovin“** — podle seznamu ingrediencí jídlo neobsahuje pšeničný / žitný / ječmenný lepek. Nic to ale neříká o křížové kontaminaci v kuchyni.
- `celiac_confirmed` = **„Podnik uvádí oddělenou přípravu“** — podnik potvrdil, že má pro toto jídlo oddělenou přípravu (nářadí, plochy, fritézu apod.). To už je relevantní pro celiaky, ale stále jde o tvrzení podniku, ne náš audit.
- `not_set` = aplikace nezobrazuje žádný gluten štítek.

Štítek typu „vhodné pro celiaky“ jako finální záruku použijeme **až později**, a jen pokud podnik tuto přípravu jasně potvrdí v ověřeném procesu. V první verzi aplikace tento štítek nepoužíváme.

## Poznámka kuchaře / příběh jídla

Pole `chefNote` slouží jako značka a osobní příběh jídla (např. „mleté maso meleme každé ráno“). **Nenahrazuje alergenní informace.** Je to copy, ne datový kontrakt.

## Princip zobrazení

Všude, kde aplikace zobrazuje ingredience, alergeny nebo gluten info, doplníme krátké, viditelné upozornění:

> Informace zadává podnik. Při alergii nebo celiakii se raději zeptej obsluhy.

Toto upozornění je úmyslně lidské, ne právní disclaimer. Cíl je, aby uživatel zpráv věřil, ale věděl, kde si ji má znovu ověřit.
