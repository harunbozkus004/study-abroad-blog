// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// 1) Create a Supabase project.
// 2) Go to Project Settings → API.
// 3) Paste your Project URL and anon public key below.
// Note: the anon public key is meant to be visible in frontend code.

const SUPABASE_URL      = 'https://vojqdqdahiloqxuxcdjh.supabase.co';       // e.g. https://abcxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanFkcWRhaGlsb3F4dXhjZGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNDcwMzMsImV4cCI6MjA5MjgyMzAzM30.UqfaVk6NDceTQ2SEFbaiSOmW4SB2XajhkgGBHLe5mvs';  // long string starting with eyJ...

const SB_CONFIGURED = !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
const sb = SB_CONFIGURED ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function fromDb(table, row) {
  if (!row) return row;

  if (table === 'photos' || table === 'food') {
    const { img_url, created_at, ...rest } = row;
    return { ...rest, imgUrl: img_url || '' };
  }

  const { created_at, ...rest } = row;
  return rest;
}

function toDb(table, item) {
  const clean = { ...item };

  // Supabase owns these fields. Never send id back during insert/update.
  delete clean.id;
  delete clean.created_at;

  if (table === 'photos' || table === 'food') {
    clean.img_url = clean.imgUrl || '';
    delete clean.imgUrl;
  }

  return clean;
}

async function getAll(table) {
  if (!sb) return [];

  const { data, error } = await sb
    .from(table)
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error(`${table} load error:`, error);
    return [];
  }

  return data.map(row => fromDb(table, row));
}

async function saveRow(table, item) {
  if (!sb) throw new Error('Supabase is not configured.');

  const row = toDb(table, item);
  const query = item.id
    ? sb.from(table).update(row).eq('id', item.id).select().single()
    : sb.from(table).insert(row).select().single();

  const { data, error } = await query;

  if (error) {
    console.error(`${table} save error:`, error);
    throw error;
  }

  return fromDb(table, data);
}

async function deleteRow(table, id) {
  if (!sb) throw new Error('Supabase is not configured.');

  const { error } = await sb.from(table).delete().eq('id', id);

  if (error) {
    console.error(`${table} delete error:`, error);
    throw error;
  }
}

// Uploads a File object to the public Supabase Storage bucket named blog-images.
async function uploadImage(file) {
  if (!sb || !file) return null;

  const ext = file.name.split('.').pop() || 'jpg';
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  const { error } = await sb.storage
    .from('blog-images')
    .upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  const { data } = sb.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}

function subscribeToChanges(onChange) {
  if (!sb) return null;

  const channel = sb
    .channel('anamika-abroad-live-data')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'food' }, onChange)
    .subscribe();

  return () => sb.removeChannel(channel);
}

window.AA_DB = {
  isConfigured: SB_CONFIGURED,
  getAll,
  saveRow,
  deleteRow,
  uploadImage,
  subscribeToChanges
};

// ── SQL TO RUN IN SUPABASE SQL EDITOR ────────────────────────────────────────
/*
create table if not exists posts (
  id bigint primary key generated always as identity,
  location text,
  coords jsonb,
  title text,
  date text,
  tags jsonb default '[]'::jsonb,
  highlights jsonb default '[]'::jsonb,
  body text,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists photos (
  id bigint primary key generated always as identity,
  caption text,
  location text,
  tags jsonb default '[]'::jsonb,
  img_url text default '',
  height int default 200,
  created_at timestamptz default now()
);

create table if not exists food (
  id bigint primary key generated always as identity,
  name text,
  restaurant text default '',
  location text,
  stars int default 5,
  description text default '',
  tags jsonb default '[]'::jsonb,
  img_url text default '',
  height int default 200,
  created_at timestamptz default now()
);

alter table posts enable row level security;
alter table photos enable row level security;
alter table food enable row level security;

create policy "posts public read" on posts for select using (true);
create policy "posts public insert" on posts for insert with check (true);
create policy "posts public update" on posts for update using (true);
create policy "posts public delete" on posts for delete using (true);

create policy "photos public read" on photos for select using (true);
create policy "photos public insert" on photos for insert with check (true);
create policy "photos public update" on photos for update using (true);
create policy "photos public delete" on photos for delete using (true);

create policy "food public read" on food for select using (true);
create policy "food public insert" on food for insert with check (true);
create policy "food public update" on food for update using (true);
create policy "food public delete" on food for delete using (true);

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

create policy "blog images public read" on storage.objects
for select using (bucket_id = 'blog-images');

create policy "blog images public upload" on storage.objects
for insert with check (bucket_id = 'blog-images');

alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table photos;
alter publication supabase_realtime add table food;
*/
