#!/bin/sh
set -eu

cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' "Python 3 is required to serve this app locally."
  exit 1
fi

PORT=4173
while python3 -c 'import socket, sys; s = socket.socket(); s.settimeout(0.2); busy = s.connect_ex(("127.0.0.1", int(sys.argv[1]))) == 0; s.close(); sys.exit(0 if busy else 1)' "$PORT"; do
  PORT=$((PORT + 1))
done

python3 -m http.server "$PORT" --bind 127.0.0.1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

sleep 1
open "http://127.0.0.1:$PORT/"
wait "$SERVER_PID"
