# WytNet Local Setup (Windows)

This setup gives you a stable local URL every time:

- App URL: http://127.0.0.1:5180
- Port: 5180
- Database: PostgreSQL on 127.0.0.1:5432

## 1) Install PostgreSQL (one time)

Install using winget:

```powershell
winget install -e --id PostgreSQL.PostgreSQL.17
```

After install, make sure PostgreSQL service is running.

## 2) Create local database (one time)

Use pgAdmin or psql to create DB/user matching `.env`:

- user: `postgres`
- password: `postgres`
- database: `wytnet_local`

If using psql:

```sql
CREATE DATABASE wytnet_local;
```

## 3) Configure env (one time)

`.env` is already created from `.env.example`.

Default values:

- `PORT=5180`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/wytnet_local`

Update password/user if your PostgreSQL credentials differ.

## 4) Run schema migration

```powershell
npm run db:push
```

## 5) Start app anytime

```powershell
npm run dev:local
```

Then open:

http://127.0.0.1:5180

## Notes

- Missing API keys only disable optional integrations (AI, payments, social providers).
- Core app + DB flows work once PostgreSQL is reachable.
