#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-all}"
FAILURES=0

note() {
  printf '%s\n' "$1"
}

pass() {
  printf '[PASS] %s\n' "$1"
}

fail() {
  printf '[FAIL] %s\n' "$1"
  FAILURES=$((FAILURES + 1))
}

check_no_latest() {
  local file="$1"
  if grep -q '"latest"' "$file"; then
    fail "$file still contains unpinned dependency versions"
  else
    pass "$file uses pinned dependency versions"
  fi
}

check_no_placeholders() {
  local file="$1"
  if grep -Eqi 'replace-with|your-deployed-domain|placeholder support|Before launch, replace|For launch, replace' "$file"; then
    fail "$file still contains launch placeholder text"
  else
    pass "$file has production-safe public copy"
  fi
}

check_exists() {
  local path="$1"
  local label="$2"
  if [ -e "$path" ]; then
    pass "$label exists"
  else
    fail "$label is missing"
  fi
}

note "Running FarmYard launch audit in '$MODE' mode"

check_no_latest "$ROOT_DIR/package.json"
check_no_placeholders "$ROOT_DIR/privacy.html"
check_no_placeholders "$ROOT_DIR/support.html"

case "$MODE" in
  all)
    check_no_latest "$ROOT_DIR/farmyard-android/package.json"
    check_no_latest "$ROOT_DIR/farmyard-ios/package.json"
    check_no_placeholders "$ROOT_DIR/farmyard-android/web/privacy.html"
    check_no_placeholders "$ROOT_DIR/farmyard-android/web/support.html"
    check_no_placeholders "$ROOT_DIR/farmyard-ios/web/privacy.html"
    check_no_placeholders "$ROOT_DIR/farmyard-ios/web/support.html"
    check_exists "$ROOT_DIR/android" "root Android project"
    check_exists "$ROOT_DIR/ios" "root iOS project"
    ;;
  android)
    check_no_latest "$ROOT_DIR/farmyard-android/package.json"
    check_no_placeholders "$ROOT_DIR/farmyard-android/web/privacy.html"
    check_no_placeholders "$ROOT_DIR/farmyard-android/web/support.html"
    check_exists "$ROOT_DIR/farmyard-android/android" "Android native project"
    ;;
  ios)
    check_no_latest "$ROOT_DIR/farmyard-ios/package.json"
    check_no_placeholders "$ROOT_DIR/farmyard-ios/web/privacy.html"
    check_no_placeholders "$ROOT_DIR/farmyard-ios/web/support.html"
    check_exists "$ROOT_DIR/farmyard-ios/ios" "iOS native project"
    ;;
  *)
    fail "Unknown audit mode '$MODE'. Use all, android, or ios."
    ;;
esac

if [ "$FAILURES" -gt 0 ]; then
  note "Launch audit finished with $FAILURES issue(s)."
  exit 1
fi

note "Launch audit passed."
