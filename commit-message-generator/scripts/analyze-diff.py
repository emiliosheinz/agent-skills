#!/usr/bin/env python3
"""Analyze git state and print structured facts for the agent.

Sole source of truth for what the working tree contains. The agent must run
this script before writing a commit message and never read the diff manually.

Modes (auto-detected, staged wins):

  Staged   — staged files exist. Prints:
      State         : staged
      Branch, Files changed, Status counts, Suggested type,
      Likely scopes, Files (status\tpath).
  Unstaged — no staged files but unstaged tracked or untracked files exist.
      Prints:
      State         : unstaged
      Branch, Files changed (tracked+untracked), Status counts,
      Likely scopes, Files (status\tpath; untracked marked with `?`).
      Agent then proposes commit groups.
  Empty    — nothing to commit. Exits 1.

Flags:
  --json         Emit JSON instead of the human-readable block.
  --self-check   Run internal assertions and exit.

Never writes a commit message. That is the agent's job.
"""

from __future__ import annotations

import json
import subprocess
import sys
from collections import Counter


def run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        sys.exit(result.returncode)
    return result.stdout


def top_level(path: str) -> str:
    return path.split("/", 1)[0] if "/" in path else "."


def is_test_path(path: str) -> bool:
    lower = path.lower()
    parts = lower.split("/")
    if any(p in {"tests", "test", "__tests__", "spec", "specs"} for p in parts):
        return True
    name = parts[-1]
    return (
        name.startswith("test_")
        or name.endswith("_test.py")
        or ".test." in name
        or ".spec." in name
    )


def parse_name_status(raw: str) -> list[tuple[str, str]]:
    entries: list[tuple[str, str]] = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        status = parts[0]
        path = parts[-1]
        entries.append((status[0], path))
    return entries


def suggest_type(entries: list[tuple[str, str]]) -> str:
    if not entries:
        return "fix"
    paths = [p for _, p in entries]
    if all(is_test_path(p) for p in paths):
        return "test"
    if any(status in {"A", "?"} for status, _ in entries):
        return "feat"
    return "fix"


def collect_staged() -> list[tuple[str, str]]:
    raw = run(["git", "diff", "--staged", "--name-status"]).strip()
    return parse_name_status(raw) if raw else []


def collect_unstaged_tracked() -> list[tuple[str, str]]:
    raw = run(["git", "diff", "--name-status"]).strip()
    return parse_name_status(raw) if raw else []


def collect_untracked() -> list[tuple[str, str]]:
    raw = run(["git", "ls-files", "--others", "--exclude-standard"]).strip()
    if not raw:
        return []
    return [("?", line) for line in raw.splitlines() if line.strip()]


def build_report(state: str, entries: list[tuple[str, str]], branch: str) -> dict:
    counts = Counter(status for status, _ in entries)
    scopes = sorted({top_level(p) for _, p in entries if top_level(p) != "."})
    return {
        "state": state,
        "branch": branch,
        "files_changed": len(entries),
        "status_counts": dict(counts),
        "suggested_type": suggest_type(entries),
        "likely_scopes": scopes,
        "files": [{"status": s, "path": p} for s, p in entries],
    }


def print_human(report: dict) -> None:
    counts_str = " ".join(f"{k}={v}" for k, v in sorted(report["status_counts"].items()))
    scopes = ", ".join(report["likely_scopes"]) if report["likely_scopes"] else "(root)"
    print(f"State         : {report['state']}")
    print(f"Branch        : {report['branch']}")
    print(f"Files changed : {report['files_changed']}")
    print(f"Status counts : {counts_str}")
    print(f"Suggested type: {report['suggested_type']}")
    print(f"Likely scopes : {scopes}")
    print("Files         :")
    for f in report["files"]:
        print(f"  {f['status']}\t{f['path']}")


def main(as_json: bool) -> int:
    branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"]).strip()

    staged = collect_staged()
    if staged:
        report = build_report("staged", staged, branch)
    else:
        unstaged = collect_unstaged_tracked() + collect_untracked()
        if not unstaged:
            msg = "Nothing to commit. Working tree clean."
            if as_json:
                print(json.dumps({"state": "empty", "message": msg}))
            else:
                print(msg)
            return 1
        report = build_report("unstaged", unstaged, branch)

    if as_json:
        print(json.dumps(report))
    else:
        print_human(report)
    return 0


def self_check() -> None:
    assert top_level("src/api/foo.ts") == "src"
    assert top_level("README.md") == "."
    assert is_test_path("tests/foo.py")
    assert is_test_path("src/foo.test.ts")
    assert is_test_path("__tests__/bar.js")
    assert not is_test_path("src/foo.ts")
    assert suggest_type([("A", "src/foo.ts")]) == "feat"
    assert suggest_type([("?", "src/new.ts")]) == "feat"
    assert suggest_type([("M", "tests/a.py"), ("M", "tests/b.py")]) == "test"
    assert suggest_type([("M", "src/foo.ts")]) == "fix"
    assert suggest_type([]) == "fix"

    report = build_report(
        "unstaged",
        [("M", "src/api/foo.ts"), ("?", "src/api/new.ts"), ("M", "README.md")],
        "main",
    )
    assert report["state"] == "unstaged"
    assert report["files_changed"] == 3
    assert report["status_counts"] == {"M": 2, "?": 1}
    assert report["likely_scopes"] == ["src"]
    assert report["suggested_type"] == "feat"

    empty = build_report("staged", [], "main")
    assert empty["files_changed"] == 0
    assert empty["likely_scopes"] == []

    payload = json.loads(json.dumps(report))
    assert payload["files"][0] == {"status": "M", "path": "src/api/foo.ts"}

    print("self-check ok")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--self-check" in args:
        self_check()
        sys.exit(0)
    sys.exit(main(as_json="--json" in args))
