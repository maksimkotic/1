import { query, pool } from "../src/db.js";

const schemaSql = `
create table if not exists app_user (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists post (
  id bigserial primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
`;

const seedSql = `
insert into post (title, body)
values
  ('Старт', 'В базе есть тестовая запись. Дальше сюда можно добавлять материалы и статистику.'),
  ('Геоэкология', 'Нагрузка → перенос → аккумуляция. Вода — интегратор процессов в бассейне.');
`;

async function main() {
  await query(schemaSql);

  const existing = await query(`select count(*)::int as n from post`);
  if (existing.rows[0].n === 0) {
    await query(seedSql);
    console.log("[db:init] seeded posts");
  } else {
    console.log("[db:init] posts already exist, skipping seed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[db:init] failed", e);
    process.exit(1);
  })
  .finally(() => pool.end());

