#!/usr/bin/env bash
set -e

echo "[*] Running bot..."
node --experimental-sqlite --disable-wasm-trap-handler index.js
