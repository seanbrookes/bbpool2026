# bbpool2026
Annual friends baseball pool site.

Note to self: use Google sheets  for the draft/protected list

at the beginning of the season we need to:
- update the year in a number of places (page and documentation titles, fetch urls, etc)
- each player needs a unique 'nickname' to bridge unique/foreign key links for players with no official record at mlb yet
- when we copy over the roster json it is important to zero out the totals of each player to avoid distortion at the beginning of the year.
- each year we protect 10 or 12 players

It hosts 4 teams with protected rosters between seasons and then facilitates a draft before the season to fill out unprotected positions in each roster.

Players are mapped to player id properties from the mlb stats db.

On demand the latest stats are pulled from the api and a React context state store is created and cached for the duration of the visit.

The project needs a '/bak' folder to be created on the root to write backup roster files to

Each roster is comprised of top players at each of the main positions scoring based on key stats
hitters: runs, hits, HR's, rbi, sb
starters: wins, losses, and k's
closers: wins, saves, k's

Hosted as a static site on **Cloudflare Pages**. See [DEPLOY.md](DEPLOY.md) for the
deployment process.

![pool screenshot](https://user-images.githubusercontent.com/1751524/124396823-ce6ccb00-dcc0-11eb-81cd-e390f6bb16f0.png)


## Developing locally
This is a **Vite + Vue** application. `npm run dev` runs Vite alongside a small
Express server (`server.js`) that provides a local-only `/api/...` for editing
rosters. Vite proxies `/api` to that server.
Note this api is only for local development — there is no api in production and no
persistence (the built site fetches stats directly from the MLB api).

```
$npm run dev
```
should come up on port 2026

### Local editing controls
The `/admin` route exposes the roster editing controls. It is only registered when
running in dev (`import.meta.env.DEV`), so it is not present in the production
build. Saving there writes back to `src/data/rosters2026.json` (via the Express
api) and backs up the previous file to `/bak`.

https://github.com/seanbrookes/bbpool2026

```
hiiter total calc:
      totalVal = (baseValObj.r) + (baseValObj.h / 2) + (baseValObj.rbi) + (baseValObj.hr * 2) + (baseValObj.sb / 2);

      starter totals:
       totalVal = ((baseValObj.w * 15) - (baseValObj.l * 4) + (baseValObj.k / 2));

       closer totals
           totalVal = (baseValObj.sv * 7) + (baseValObj.w * 6) + (baseValObj.k / 2) + (baseValObj.ip / 2);


```
## moving players around after a trade
- this is a pretty manual process
- add players to new rosters
- delete players from old roster
- manulally update rosters.json to change prospects to regular status
- remap the player ids
- click 'process nicknames' button to update roster so they score

special note of appreciation for mlb to be ok with small fish accessing their stats api.
