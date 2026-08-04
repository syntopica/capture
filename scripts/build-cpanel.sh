#!/usr/bin/env bash
#
# Assembles the deployable bundle for the cPanel Node application on nova.
#
# Adapted from the sibling app on the same server, whose comments record what
# each step is defending against. Next.js writes a self-contained server to
# .next/standalone but does not copy .next/static into it, so the bundle has to
# be completed here.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/cpanel-build"

cd "$ROOT"

# Must happen before the build: a leftover bundle looks like a second Node
# project inside the repo and Next.js then resolves it as the workspace root.
echo "==> Cleaning $OUT"
rm -rf "$OUT"

echo "==> Cleaning .next"
rm -rf "$ROOT/.next"

echo "==> Building"
pnpm build

echo "==> Assembling $OUT"
cp -r .next/standalone "$OUT"
mkdir -p "$OUT/.next"
cp -r .next/static "$OUT/.next/static"

# This bundle ships its own node_modules, which is the opposite of what the
# sibling app on the same server does, and the reason is worth stating because
# copying its script without this note would be wrong in both directions.
#
# That app strips the traced tree because Next.js file tracing copies whatever
# THIS machine resolved, and a package with a prebuilt native binary then
# arrives built for the wrong platform - its macOS `sharp` reached production
# and every image was silently served unoptimised behind a 200.
#
# Here there is no native code to get wrong: this service answers JSON, the
# image optimiser is off (see next.config.ts) so `sharp` is not pulled in, and
# `mysql2` and `ulid` are compiled into the server chunks rather than required
# from disk. Shipping the traced tree then means production runs the exact bytes
# that were built and tested here.
#
# It also sidesteps a real constraint on the server: nova's pnpm enforces a
# `minimumReleaseAge` supply-chain policy and refuses a lockfile resolved the
# same day. Installing there would mean either waiting or relaxing that policy
# on a machine that carries client data, and neither is a good trade for a
# dependency tree with nothing platform-specific in it.
echo "==> Checking the bundle carries no native binaries"
if [ -n "$(find "$OUT/node_modules" -name '*.node' -print -quit 2>/dev/null)" ]; then
  echo "ERROR: the traced node_modules contains a compiled binary:" >&2
  find "$OUT/node_modules" -name '*.node' >&2
  echo >&2
  echo "It was built for $(uname -s)/$(uname -m); the server is Linux/x86_64." >&2
  echo "Either drop the dependency that pulls it in, or go back to installing" >&2
  echo "on the server and mind the supply-chain policy there." >&2
  exit 1
fi

# The lockfiles travel so the server can still reproduce the tree if it ever
# has to, even though nothing installs there today.
cp pnpm-lock.yaml pnpm-workspace.yaml "$OUT/"

echo "==> Done"
du -sh "$OUT"
echo
echo "Deploy with:"
echo "  rsync -az --delete --exclude '.env' -e 'ssh -p 6922' \\"
echo "    cpanel-build/ <host>:/home/cristiandev/apps/brain-capture/"
echo
echo "The .env on nova is NOT in this bundle and must survive the upload."
echo "Startup file: server.js"
