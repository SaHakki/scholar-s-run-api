# Scholar's Run API

Backend API for **Scholar's Run**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Paul Harren Raquid (SaHakki), BSCS 3-1
- Group and game concept: 3C

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone [repository-url]
cd [folder-name]
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

### What "completed" means in my game

A player is considered completed if their run has a `FINISHED` status when the tournament ends. Players with an `ELIMINATED` status are marked as not completed. Eliminated players remain in the final results with their final scores but do not receive a leaderboard rank or podium placement.

### Tables

| Table | Purpose |
|---|---|
| `users` | Stores user account information, including name, role, school ID, and email. |
| `game_sessions` | Stores tournament sessions, join codes, status, host, and start/end times. |
| `seats` | Connects users to tournament sessions and stores their in-game nicknames. |
| `runs` | Stores player status, Energy, accumulated points, final score, and run timestamps. |
| `locations` | Stores campus locations available in the game. |
| `location_routes` | Defines connections between campus locations. |
| `questions` | Stores the questions used during gameplay. |
| `location_visits` | Records locations visited during player runs. |
| `question_attempts` | Records players' question-answer attempts. |
| `location_rewards_claimed` | Records rewards claimed by players. |

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
