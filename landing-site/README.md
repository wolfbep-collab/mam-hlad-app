# landing-site

Statický microsite pro online kampaň **Mám hlad**. Čisté HTML + jedno CSS, žádný backend, žádné JS knihovny, žádný build krok.

Tahle stránka existuje proto, aby šla veřejná landing page nasadit **hned**, bez čekání na to, až bude připravený Expo web export (ten vyžaduje další web dependencies, viz `docs/launch-system/30-day-launch-plan.md`).

## Co je uvnitř

| Soubor | Stránka |
|---|---|
| `index.html` | Hlavní rozcestník — co je Mám hlad, pro koho, dvě cesty (uživatel / podnik) |
| `hungry.html` | Pro hladové lidi — „Nevíš, co si dát?“ + CTA |
| `partners.html` | Pro podniky — první partnerská vlna v Liberci + CTA |
| `privacy.html` | Jednoduché zásady soukromí |
| `support.html` | Kontakt na podporu |
| `styles.css` | Sdílený mobil-first responzivní styl |

Všechny stránky sdílejí `styles.css`, používají systémové fonty (žádné externí) a neobsahují žádné tracking skripty ani externí volání.

## Jak ho otevřít lokálně

Stačí otevřít `index.html` v prohlížeči — dvojklik na soubor funguje, protože odkazy i styl jsou relativní.

Nebo přes jednoduchý lokální server (jen pro pohodlí, není nutný):

```bash
cd landing-site
python3 -m http.server 8000
# pak otevři http://localhost:8000
```

## Jak ho nasadit

Microsite je čistě statický, takže ho zvládne jakýkoli statický hosting.

### Vercel

```bash
cd landing-site
npx vercel --prod
```

Při dotazu na nastavení: žádný build command, output directory je aktuální složka. Vercel obslouží `index.html` jako kořen.

### Netlify

- Buď přetáhni složku `landing-site/` do Netlify Drop (https://app.netlify.com/drop),
- nebo přes CLI:

```bash
cd landing-site
npx netlify deploy --prod --dir .
```

Build command: žádný. Publish directory: `.` (tj. `landing-site`).

### GitHub Pages

Nasměruj Pages na složku `landing-site/` na zvolené větvi (Settings → Pages → Build from a branch → `/landing-site`), nebo přesuň obsah do `docs/` na samostatné větvi pro Pages. Žádný workflow není potřeba.

## Co microsite NEvyžaduje

- ❌ Žádný backend ani databázi — CTA jsou prosté `mailto:` odkazy.
- ❌ Žádné Expo web dependencies (`react-native-web`, `@expo/metro-runtime`).
- ❌ Žádné npm dependencies a žádný build krok.
- ❌ Žádný tracking, žádné cookies, žádné externí fonty.

## Vztah k aplikaci

Tohle je **marketingová** vrstva, oddělená od samotné Expo aplikace v `app/` a `src/`. Texty jsou sladěné s landing routes v aplikaci (`app/partners.tsx`, `app/hungry.tsx`, `app/privacy.tsx`, `app/support.tsx`), ale microsite na aplikaci nijak nezávisí a její změny se aplikace nedotýkají.

## Pravidlo pravdivosti

Texty říkají pravdu: Mám hlad **připravuje první partnerskou vlnu v Liberci** a zatím **není veřejně v Google Play / App Store**. Nic se nesmí přidávat, co by tvrdilo opak.
