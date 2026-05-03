# Street Food — návrh Supabase schématu (DRAFT)

Stav: **draft, neaktivní**. Tento dokument popisuje, jak by Street Food vrstva
mohla vypadat v Supabase, **až** se rozhodneme pustit ji z demo režimu do
produkce. Žádná z migrací zde není napojená — je to jen plán k diskusi.

## 1. Tabulky

### `street_food_vendors`

Veřejný profil stánku. Vlastníkem je přihlášený uživatel — typicky sám
prodejce.

```sql
create table public.street_food_vendors (
  id              uuid primary key default gen_random_uuid(),
  owner_user_id   uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text not null default '',
  category        text not null check (category in (
                    'coffee','sandwich','burger','vegan_bowl','tacos',
                    'soup','sweet','asian_noodles','other'
                  )),
  tags            text[] not null default '{}',
  service_modes   text[] not null default '{pickup}',
  contact_label   text,
  instagram       text,
  website         text,
  is_public       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_vendors_owner on public.street_food_vendors(owner_user_id);
create index idx_vendors_public on public.street_food_vendors(is_public)
  where is_public = true;
```

### `street_food_menu_items`

Menu položky náležící konkrétnímu stánku.

```sql
create table public.street_food_menu_items (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid not null references public.street_food_vendors(id)
                      on delete cascade,
  name                text not null,
  description         text not null default '',
  price_level         smallint not null check (price_level between 1 and 3),
  preparation_minutes smallint not null check (preparation_minutes >= 0),
  tags                text[] not null default '{}',
  is_vegetarian       boolean not null default false,
  is_vegan            boolean not null default false,
  is_warm             boolean not null default false,
  is_sweet            boolean not null default false,
  is_light            boolean not null default false,
  is_quick            boolean not null default false,
  is_healthy          boolean not null default false,
  position            smallint not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_menu_items_vendor on public.street_food_menu_items(vendor_id);
```

### `street_food_checkins`

Záznam, že stánek dnes na nějakém místě stojí. Jeden řádek = jeden check-in.

```sql
create table public.street_food_checkins (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.street_food_vendors(id)
                  on delete cascade,
  latitude        double precision not null,
  longitude       double precision not null,
  location_label  text not null,
  active_from     timestamptz not null default now(),
  active_until    timestamptz not null,
  status          text not null default 'active'
                    check (status in ('active','inactive')),
  note            text,
  created_at      timestamptz not null default now()
);

create index idx_checkins_vendor on public.street_food_checkins(vendor_id);
create index idx_checkins_active
  on public.street_food_checkins(status, active_until)
  where status = 'active';
```

## 2. RLS principy

Cíl: prodejce upravuje jen vlastní záznamy; zákazníci vidí jen aktivní veřejné
check-iny; přesná poloha je veřejně viditelná **pouze během aktivního
check-inu**; staré check-iny se nevracejí veřejně.

```sql
alter table public.street_food_vendors enable row level security;
alter table public.street_food_menu_items enable row level security;
alter table public.street_food_checkins enable row level security;
```

### `street_food_vendors`

```sql
-- Veřejné čtení jen u zveřejněných profilů.
create policy "vendors readable when public"
  on public.street_food_vendors for select
  using (is_public = true);

-- Vlastník vidí svůj profil vždy.
create policy "owner reads own vendor"
  on public.street_food_vendors for select
  using (auth.uid() = owner_user_id);

-- Vlastník zakládá / upravuje / maže pouze sebe.
create policy "owner inserts own vendor"
  on public.street_food_vendors for insert
  with check (auth.uid() = owner_user_id);

create policy "owner updates own vendor"
  on public.street_food_vendors for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "owner deletes own vendor"
  on public.street_food_vendors for delete
  using (auth.uid() = owner_user_id);
```

### `street_food_menu_items`

```sql
-- Veřejné čtení jen pokud patří k veřejnému stánku.
create policy "menu readable for public vendor"
  on public.street_food_menu_items for select
  using (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.is_public = true
    )
  );

-- Vlastník vidí + spravuje vlastní menu.
create policy "owner reads own menu"
  on public.street_food_menu_items for select
  using (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  );

create policy "owner writes own menu"
  on public.street_food_menu_items for all
  using (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  );
```

### `street_food_checkins`

Klíčové pravidlo soukromí — **veřejně se vrací jen aktivní check-iny u veřejných
stánků**. Staré check-iny se zákazníkům nezobrazují.

```sql
-- Veřejné čtení JEN aktivních check-inů u veřejných stánků.
create policy "active checkins are public"
  on public.street_food_checkins for select
  using (
    status = 'active'
    and active_until > now()
    and exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.is_public = true
    )
  );

-- Vlastník vidí kompletní historii vlastních check-inů.
create policy "owner reads own checkins"
  on public.street_food_checkins for select
  using (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  );

-- Vlastník vytváří / mění / maže jen vlastní check-iny.
create policy "owner writes own checkins"
  on public.street_food_checkins for all
  using (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.street_food_vendors v
      where v.id = vendor_id and v.owner_user_id = auth.uid()
    )
  );
```

## 3. Doplňující soukromí / housekeeping

- **Auto-deactivate** scheduled job (pg_cron) každých 5 minut:
  ```sql
  update public.street_food_checkins
  set status = 'inactive'
  where status = 'active' and active_until <= now();
  ```
  Tím garantujeme, že po `active_until` přesná poloha přestane být veřejná i
  v případě, že prodejce check-in neukončil ručně.
- Žádný osobní údaj prodejce (e-mail, telefon, IČO) **není ve veřejných
  tabulkách**. Co kontaktní pole `contact_label` / `instagram` / `website`
  obsahuje, rozhoduje prodejce sám — výchozí je prázdné.
- **Tracking proti stalkingu**: žádné notifikace „prodejce X je teď u tebe"
  bez explicitního opt-inu na straně zákazníka.
- **Mazání**: odstraněním vendor řádku se kaskádově odstraní menu i historie
  check-inů (`on delete cascade`).
- **Logy**: pokud budeme mít audit log, ukládáme jen `vendor_id`, ne
  `owner_user_id`, abychom v auditech neaglutinovali profil osoby.

## 4. Otevřené body

- Přesný způsob ukládání souřadnic — postgis `geography(point)` vs. dvojice
  `double precision`. Pro MVP stačí dvojice + index na `(latitude, longitude)`,
  přechod na postgis je dělaný později.
- Jak řešit „opakované týdenní místo"? Asi šablona check-inů, kterou prodejce
  spustí jedním klepnutím, ne repeating row.
- Verzování menu — chceme historii cen / složení? Pravděpodobně ne pro MVP.
