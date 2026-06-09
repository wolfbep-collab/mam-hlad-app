# Mám hlad — Agentní systém

Mám hlad nechce růst tím, že zaměstná hodně lidí. Místo toho stavíme **provozní AI tým**: agenty, kteří dělají opakující se práci kolem získávání podniků, draftu profilů a kontroly kvality.

## Tři pravidla, která nikdy neporušujeme

1. **AI připravuje, člověk schvaluje, podnik potvrzuje.**
   Žádný agent nic neposílá, nepublikuje ani nemění bez explicitního odsouhlasení člověka.

2. **Žádné lži o jídle.**
   Aplikace nesmí tvrdit, že jídlo je bezpečné pro alergiky, celiaky, nebo že je bezlepkové, vegan, raw, atd., pokud podnik tuto informaci sám oficiálně nepotvrdil v ověřeném procesu. V Pilotu 0 to nikdy nepotvrdil — pravidlo platí absolutně.

3. **Člověk drží vztah s podnikem.**
   Zakladatel zná majitele, kuchaře, obsluhu osobně. AI agent je nástroj zakladatele, ne náhrada za něj. Podnik nikdy nepíše s botem — vždy s konkrétním člověkem.

## Co AI agenti dělají

- Připravují drafty zpráv pro podniky.
- Přepisují voice memo na strukturovaný profil.
- Navrhují popisy jídel, kuchařské karty, denní doporučení.
- Kontrolují alergenní rizika a zdravotní claims.
- Kontrolují úplnost profilu před schválením.
- Identifikují friction body ve workflow.

## Co AI agenti NEDĚLAJÍ

- ❌ Neodesílají zprávy podnikům.
- ❌ Nepublikují profily.
- ❌ Negarantují alergeny, celiakii, bezlepkovost.
- ❌ Nepřidávají strukturovaná data o alergenech.
- ❌ Nemění data v `recommendation engine` váhách.
- ❌ Nepíší s podnikem v reálném čase.
- ❌ Nepřibližují cenu / monetizaci v Pilotu 0.

## První použití: Pilot 0

Agentní systém poprvé reálně použijeme v **Pilotu 0** s 10 podniky v Liberci. Tam ověříme:

- Šetří agenti reálně čas? (cíl: time-to-profile z 2 h na 30–45 min)
- Vyhovuje text, který připraví Outreach Agent, reálným podnikům?
- Chytá Safety Guard Agent všechny problémy?
- Co QA Agent flagne, je opravdu problém, nebo false positive?

Po Pilotu 0 rozhodneme, jestli agenty rozšířit do Pilotu 1 (30 podniků) a jestli nastavit lehký admin tool nad nimi.

## Bezpečnostní text — všeobecný

Kdykoli agent zaváhá, je-li něco zdravotně bezpečné, použije se:

> **„Informace zadává podnik. Při alergii nebo celiakii se raději zeptej přímo obsluhy."**

Tento text už existuje v UI pod každým detailem jídla, kde se zobrazují ingredience / recept / chef note. Agenti ho nesmí přebít ani překreslit.

## Obsah složky

| Agent | Co dělá |
|---|---|
| [`outreach-agent.md`](./outreach-agent.md) | Drafty zpráv pro podniky |
| [`onboarding-agent.md`](./onboarding-agent.md) | Voice memo + materiály → profile draft |
| [`safety-guard-agent.md`](./safety-guard-agent.md) | Hlídá alergenní a zdravotní claims |
| [`qa-agent.md`](./qa-agent.md) | Kontrola úplnosti před schválením podnikem |
| [`pilot-0-agent-workflow.md`](./pilot-0-agent-workflow.md) | Krok-po-kroku workflow pro Pilot 0 |

## Vazba na ostatní dokumenty

Agenti pracují podle materiálů v `docs/pilot-0/`:

- `pitch-a5.md` — co řekneme podniku
- `whatsapp-messages.md` — šablony zpráv (Outreach Agent z toho čerpá)
- `onboarding-script.md` — 10 otázek (Onboarding Agent přepisuje voice memo z těchto otázek)
- `business-data-template.md` — cílový tvar profilu (Onboarding Agent vyplňuje)
- `decision-rules.md` — pravidla, kdy zpomalit / zastavit (i pro agentní výstupy)

Pravidlo: pokud existuje rozpor mezi tímto dokumentem a `docs/pilot-0/`, platí `docs/pilot-0/`. Agenti slouží Pilotu 0, ne naopak.
