#!/usr/bin/env bash
#
# Assembles the deployable bundle for the cPanel Node application on server-a.
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

# The dependencies are installed on server-a, not shipped from here. Next.js file
# tracing copies whatever this machine resolved, and packages with prebuilt
# native binaries then arrive built for the wrong platform.
echo "==> Dropping the traced node_modules; server-a installs its own"
rm -rf "${OUT:?}/node_modules"
cp pnpm-lock.yaml pnpm-workspace.yaml "$OUT/"

echo "==> Done"
du -sh "$OUT"
echo
echo "Upload the contents of cpanel-build/ to the cPanel Node application root,"
echo "then install the dependencies there with pnpm."
echo "Startup file: server.js"
echo
echo "The .env on server-a is NOT in this bundle and must survive the upload:"
echo "  rsync --delete --exclude '.env' ..."
