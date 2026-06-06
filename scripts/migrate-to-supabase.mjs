// Crea la tabla `properties` en Supabase y migra las propiedades actuales
// desde data/properties.js. Idempotente: se puede correr varias veces.
import { Client } from "pg";
import { properties } from "../data/properties.js";

const client = new Client({
  host: "db.fukarishpopbtxtzhrrd.supabase.co",
  port: 5432,
  user: "postgres",
  password: process.env.CLAVE_BASE_DATOS,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const CREATE_TABLE = `
create table if not exists properties (
  id            bigint primary key,
  title         text not null,
  type          text,
  modalidad     text,
  operation     text,
  location      text,
  price         numeric,
  bedrooms      integer,
  bathrooms     integer,
  area          numeric,
  description   text,
  features      text[],
  roi           numeric,
  image         text,
  image1        text,
  image2        text,
  image3        text,
  image4        text,
  lat           numeric,
  lng           numeric,
  "precioAlquilerARS" numeric,
  "disponibleDesde"   text,
  "mesesMinimos"      integer,
  condiciones         text,
  alquilada     boolean default false,
  reservada     boolean default false,
  status        text default 'disponible',
  sort_order    integer,
  created_at    timestamptz default now()
);

alter table properties add column if not exists sort_order integer;
alter table properties enable row level security;
`;

const ENSURE_POLICY = `
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'properties' and policyname = 'Lectura publica de propiedades'
  ) then
    create policy "Lectura publica de propiedades"
      on properties for select using (true);
  end if;
end $$;
`;

const COLS = [
  "id", "title", "type", "modalidad", "operation", "location", "price",
  "bedrooms", "bathrooms", "area", "description", "features", "roi",
  "image", "image1", "image2", "image3", "image4", "lat", "lng",
  "precioAlquilerARS", "disponibleDesde", "mesesMinimos", "condiciones",
  "alquilada", "reservada", "status", "sort_order",
];

function rowValues(p, index) {
  const status = p.reservada ? "reservada" : p.alquilada ? "alquilada" : "disponible";
  return [
    p.id, p.title, p.type ?? null, p.modalidad ?? null, p.operation ?? null,
    p.location ?? null, p.price ?? null, p.bedrooms ?? null, p.bathrooms ?? null,
    p.area ?? null, p.description ?? null, p.features ?? null, p.roi ?? null,
    p.image ?? null, p.image1 ?? null, p.image2 ?? null, p.image3 ?? null,
    p.image4 ?? null, p.lat ?? null, p.lng ?? null,
    p.precioAlquilerARS ?? null, p.disponibleDesde ?? null,
    p.mesesMinimos ?? null, p.condiciones ?? null,
    p.alquilada ?? false, p.reservada ?? false, status, index,
  ];
}

async function main() {
  await client.connect();
  console.log("Conectado a la base.");

  await client.query(CREATE_TABLE);
  await client.query(ENSURE_POLICY);
  console.log("Tabla y política listas.");

  const quotedCols = COLS.map((c) => `"${c}"`).join(", ");
  const placeholders = COLS.map((_, i) => `$${i + 1}`).join(", ");
  const updates = COLS.filter((c) => c !== "id")
    .map((c) => `"${c}" = excluded."${c}"`)
    .join(", ");
  const sql = `insert into properties (${quotedCols}) values (${placeholders})
               on conflict (id) do update set ${updates};`;

  let ok = 0;
  for (let i = 0; i < properties.length; i++) {
    await client.query(sql, rowValues(properties[i], i));
    ok++;
  }
  console.log(`Migradas ${ok} propiedades.`);

  const { rows } = await client.query("select count(*)::int as n from properties");
  console.log(`Total en la base: ${rows[0].n}`);

  await client.end();
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
