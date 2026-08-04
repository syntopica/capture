# capture-service

The URL inbox for the phone. It records URLs, answers whether a URL is already
recorded, and repeats how far the clip for it got. That is the whole service -
it never decides that last answer, it is told.

Design: `~/p/brain/docs/superpowers/specs/2026-08-04-capture-service-design.md`.

## What it deliberately does not do

No fetching, no extraction, no assets, no git, and no write to `clips/`. It
holds **no GitHub credential**, because it writes to no repository.

That scope is the design rather than a first cut. An earlier draft had the
service refetch each page and commit complete clips, and every hard problem in
it descended from that one requirement: an SSRF policy for an outbound call
driven by an untrusted URL, roughly twenty requests per capture once assets were
included, a queue and a worker behind them, and a commit path written against
the GitHub Git Data API. Removing the fetch removed all of it, and the blast
radius of a full compromise here is now "someone can read and write a list of
saved URLs".

The body of an article still arrives, through the harvest on the owner's Mac,
which already fetches Medium daily. The accepted cost is that an article deleted
between the clip and the harvest is lost.

## API

Every call needs `Authorization: Bearer <capture token>`.

| Call                              | Does                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `POST /api/capture`               | Record a URL. `201` new, `200` already captured           |
| `GET /api/have?url=`              | Has this URL been captured, and how far did its clip get? |
| `GET /api/captures?drained=false` | What the drain has not taken yet                          |
| `PATCH /api/captures/<id>`        | Mark one capture as taken, and record its state           |

```bash
curl -X POST https://<host>/api/capture \
  -H "authorization: Bearer $CAPTURE_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"url":"https://…","note":"","captured_at":"2026-08-04T12:00:00+02:00","capture_source":"ios-shortcut"}'
```

Responses are `{ data }` on success and `{ error: { code, message } }` on
failure.

### Three behaviours worth knowing before reading the code

**A malformed URL is refused, not repaired.** Both captures the old GitHub lane
produced carry `url: Imagen\nhttps://…` - a Shortcuts variable label leaked into
the field and the Contents API committed it, because nothing on the far end
read. Surrounding whitespace is trimmed; anything else is a `400` whose message
reaches the phone as the Shortcut's notification. A service that silently
repairs its client's bugs makes them permanent.

**`drained_at` means "taken out of the inbox" and nothing more.** Not "a page
was written" - that is `state`, below, and the two are deliberately separate
columns. The consumer marks a capture _after_ it has the URL in hand, so a drain
that dies halfway is simply re-run: taking a URL twice is harmless because the
URL index dedupes downstream, losing one is not.

**`state` is received, never derived.** It says how far the clip for a URL got -
`captured`, `ingested` or `needs-claude` - and the service does not know that
and must not guess: the ledger under `~/p/brain/.ingest/clips/` decides, and the
Mac pushes here once that ledger is on `origin/main`. This column repeats the
answer so a client with no access to the ledger can read it, which today is the
browser extension colouring its toolbar icon per tab.

That reverses an earlier rule of this service - that an inbox learning whether a
page was written becomes a second ledger. The reversal is deliberate and the
reasoning is in the capture-service spec's 2026-08-04 amendment; what keeps the
old objection from coming true is the direction of travel. Nothing here computes
a state, and a mirror that has drifted is repaired by re-running
`~/p/brain/tools/capture/push_index_to_service.py`, never by reasoning in this
codebase.

## URL normalisation is a contract, not an implementation detail

`src/utils/url/normalizeUrl.ts` is a port of `normalize()` in
`~/p/brain/tools/capture/url_index.py`, and the two must stay byte-identical.
They answer the same question - "do we already have this?" - from two stores,
and 1484 rows are already keyed by the Python version. `normalizeUrl.test.ts`
holds the parity cases. Change both or neither.

## Auth

Tokens live in `capture_tokens` as SHA-256 digests, one row per device, so a
database dump leaks no credential and revoking one is an `UPDATE` rather than a
redeploy. That property is the whole reason a capture token replaced a GitHub
PAT, whose blast radius was every repository the owner has and which sits in an
iCloud-synced plist.

```bash
node scripts/mint-token.mjs "iphone"   # prints the token once, plus the INSERT
```

## Local development

```bash
pnpm install
mysql -u root -p < schema.sql          # into a database of its own
node scripts/mint-token.mjs "local-dev"
cp .env.example .env.local             # fill in the database credentials
pnpm dev
```

`pnpm check` runs type-check, format check and the unit tests. The integration
suite needs a real database and skips without one:

```bash
env $(grep -v '^#' .env.local | xargs) pnpm test
```

It is worth running. The dedup reporting bug it guards - a fresh insert and an
absorbed duplicate both reporting `affectedRows: 1`, because mysql2 connects
with `CLIENT_FOUND_ROWS` - is invisible to every unit test, since the wrong
value comes from the driver.

## Deploying to server-a

It runs under the a cPanel account as a Next.js standalone
app behind Passenger, the same shape as the sibling app on that server.

```bash
pnpm build:cpanel     # produces cpanel-build/
```

Upload the contents of `cpanel-build/`, install dependencies there with pnpm,
and set the startup file to `server.js`.

**The `.env` on the server is not in the bundle and must survive the upload:**
`rsync --delete --exclude '.env'`. The sibling app carries that exclusion for
the same reason, and it is also why this service keeps its data in MySQL rather
than in a file inside the application directory.

## If content capture is ever added

One `GET` storing raw HTML, no extraction and no assets - one request per
capture rather than twenty-one - and processing happens later from the stored
bytes.

Before that ships, note what the design records: server-a's loopback carries two
Redis instances with no password, and **cPanel account separation does not cover
this** - it isolates files and MySQL grants, but any process on the host reaches
loopback TCP regardless of which account runs it. They are safe today only
because nothing on that machine makes outbound requests a third party chooses.
So either both get a password first, or the fetch runs somewhere that has no
loopback of ours.
