#!/bin/sh
set -eu

mkdir -p /state/browser-profiles /state/huggingface /artifacts

# A recreated container has a new hostname. Chromium's persistent profile
# lock symlinks can therefore look active even though the old container and
# browser are gone. Entry point runs before any browser process exists, so it
# is the one safe place to remove only these three transient singleton locks.
find /state/browser-profiles -type d -name dy_user_data_dir -exec sh -c '
  for profile_root do
    rm -f -- \
      "$profile_root/SingletonLock" \
      "$profile_root/SingletonCookie" \
      "$profile_root/SingletonSocket"
  done
' sh {} +

Xvfb :99 -screen 0 1920x1080x24 -ac -nolisten tcp &
openbox >/tmp/openbox.log 2>&1 &
x11vnc -display :99 -forever -shared -nopw -localhost -rfbport 5900 >/tmp/x11vnc.log 2>&1 &
websockify --web=/usr/share/novnc 7900 localhost:5900 >/tmp/novnc.log 2>&1 &

while :; do
  if ! pgrep -x Xvfb >/dev/null || ! pgrep -f "websockify.*7900" >/dev/null; then
    exit 1
  fi
  sleep 5
done
