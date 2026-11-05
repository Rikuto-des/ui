#!/bin/sh
# Takes the Linux visual baselines (tests/visual/__screenshots__/linux) in the
# same container image as CI's "Visual (chromium)" job. The working tree is
# copied inside the container, so the host's node_modules is left alone; only
# the screenshots come back. It runs as linux/amd64 like CI, emulated on Apple
# silicon (slower), since Chromium's rasterizing can differ by architecture.
#   sh scripts/visual-linux.sh          # update the Linux baselines
#   sh scripts/visual-linux.sh check    # compare against them, as CI does
set -eu
image=mcr.microsoft.com/playwright:v1.64.1-noble
task=${1:-update}
[ "$task" = check ] && run="pnpm test:visual" || run="pnpm test:visual:update"
root=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$root/tests/visual/__screenshots__/linux"
docker run --rm --ipc=host --platform linux/amd64 \
  -v "$root":/src:ro \
  -v "$root/tests/visual/__screenshots__/linux":/out \
  "$image" bash -euc "
    curl -fsSL https://nodejs.org/dist/v24.18.0/node-v24.18.0-linux-\$(dpkg --print-architecture | sed s/amd64/x64/).tar.gz | tar -xz -C /opt
    export PATH=/opt/node-v24.18.0-linux-\$(dpkg --print-architecture | sed s/amd64/x64/)/bin:\$PATH
    mkdir /work && cd /src && tar --exclude=./node_modules --exclude='*/node_modules' --exclude=./dist --exclude=./test-results \
      --exclude='./apps/*/.next' --exclude='./apps/*/out' --exclude='./apps/*/dist' -cf - . | tar -xf - -C /work
    cd /work && rm -rf tests/visual/__screenshots__/linux && cp -r /out tests/visual/__screenshots__/linux
    corepack enable >/dev/null && CI=1 pnpm install --frozen-lockfile >/dev/null
    pnpm gen >/dev/null
    $run
    [ '$task' = check ] || { rm -rf /out/* && cp -r tests/visual/__screenshots__/linux/. /out/; }
  "
