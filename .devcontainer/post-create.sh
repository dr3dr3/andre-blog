#!/usr/bin/env bash
#
# Runs once, the first time the container is created (devcontainer.json ->
# postCreateCommand), as the remote user.
#
# Docker creates named volumes root-owned, so the mount points declared in
# devcontainer.json need handing back to the dev user before anything can
# write to them.
set -euo pipefail

USER_NAME="$(id -un)"
USER_GROUP="$(id -gn)"

for dir in "${HOME}/.claude" "${HOME}/.aws" "${HOME}/.pnpm-store" /commandhistory; do
    if [ -d "$dir" ] && [ ! -w "$dir" ]; then
        sudo chown -R "${USER_NAME}:${USER_GROUP}" "$dir"
    fi
done

# pnpm is not baked into the image. Corepack ships with Node and fetches the
# exact version pinned by `packageManager` in package.json. The shim lives in
# ~/.local/bin (already on PATH), which is container-local rather than a volume,
# so it has to be recreated on every rebuild.
mkdir -p "${HOME}/.local/bin"
corepack enable --install-directory "${HOME}/.local/bin" pnpm >/dev/null 2>&1 \
    || echo "post-create: corepack could not install the pnpm shim; run 'corepack enable' by hand"

# Chromium, for Lighthouse and any browser-based check.
#
# Without it the performance budget in docs/PERFORMANCE.md cannot be verified
# from inside the container at all — it has to be run by hand and pasted back,
# which is how a design pass once went two days measuring nothing. Playwright's
# build is pinned and container-friendly; --with-deps pulls the system
# libraries, which is why this needs the passwordless sudo the image grants.
if [ ! -d "${HOME}/.cache/ms-playwright" ]; then
    echo "post-create: installing Chromium for Lighthouse (~150MB, once)"
    pnpm dlx playwright install --with-deps chromium \
        || echo "post-create: Chromium install failed; 'pnpm lighthouse' will not run until it succeeds"
fi

# Persist bash history to the /commandhistory volume so it survives rebuilds.
# `history -a` flushes after every command rather than only on clean exit.
if [ -d /commandhistory ] && ! grep -q 'commandhistory/.bash_history' "${HOME}/.bashrc" 2>/dev/null; then
    cat >> "${HOME}/.bashrc" <<'EOF'

# --- devcontainer: persistent shell history -------------------------------
export HISTFILE=/commandhistory/.bash_history
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoreboth
shopt -s histappend
# Flush after every command so history survives a container stop, not just a
# clean shell exit. Deliberately not exported, and guarded, so nested shells
# don't keep prepending another copy of `history -a`.
case "${PROMPT_COMMAND:-}" in
    *"history -a"*) ;;
    *) PROMPT_COMMAND="history -a${PROMPT_COMMAND:+; ${PROMPT_COMMAND}}" ;;
esac
# --------------------------------------------------------------------------
EOF
fi

echo "post-create: done"
