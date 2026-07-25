#!/usr/bin/env python3
"""Analyze staged changes and print structured facts for the agent.

Sole source of truth for what the staged diff contains. The agent must run this
script before writing a commit message and never read the diff manually.

Prints (in order):
    Branch        : current branch name
    Files changed : count
    Status counts : A=added M=modified D=deleted R=renamed
    Suggested type: feat | test | fix (heuristic — agent may override)
    Likely scopes : top-level folders touched (sorted, deduped)
    Files         : one per line, "<status>\t<path>"

Never writes or suggests a commit message. That is the agent's job.
"""

from __future__ import annotations

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
    # "src/api/foo.ts" -> "src"; "README.md" -> "."
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
        # Rename/copy status is "R100" or "C075" followed by old + new path
        path = parts[-1]
        entries.append((status[0], path))
    return entries


def suggest_type(entries: list[tuple[str, str]]) -> str:
    if not entries:
        return "fix"
    paths = [p for _, p in entries]
    if all(is_test_path(p) for p in paths):
        return "test"
    if any(status == "A" for status, _ in entries):
        return "feat"
    return "fix"


def main() -> int:
    raw = run(["git", "diff", "--staged", "--name-status"]).strip()
    if not raw:
        print("No staged changes. Stage files with `git add` first.")
        return 1

    entries = parse_name_status(raw)
    branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"]).strip()

    counts = Counter(status for status, _ in entries)
    counts_str = " ".join(f"{k}={v}" for k, v in sorted(counts.items()))

    scopes = sorted({top_level(p) for _, p in entries if top_level(p) != "."})

    print(f"Branch        : {branch}")
    print(f"Files changed : {len(entries)}")
    print(f"Status counts : {counts_str}")
    print(f"Suggested type: {suggest_type(entries)}")
    print(f"Likely scopes : {', '.join(scopes) if scopes else '(root)'}")
    print("Files         :")
    for status, path in entries:
        print(f"  {status}\t{path}")
    return 0


if __name__ == "__main__":
    # ponytail: assert-based self-check; run with `python analyze-diff.py --self-check`
    if len(sys.argv) > 1 and sys.argv[1] == "--self-check":
        assert top_level("src/api/foo.ts") == "src"
        assert top_level("README.md") == "."
        assert is_test_path("tests/foo.py")
        assert is_test_path("src/foo.test.ts")
        assert is_test_path("__tests__/bar.js")
        assert not is_test_path("src/foo.ts")
        assert suggest_type([("A", "src/foo.ts")]) == "feat"
        assert suggest_type([("M", "tests/a.py"), ("M", "tests/b.py")]) == "test"
        assert suggest_type([("M", "src/foo.ts")]) == "fix"
        print("self-check ok")
        sys.exit(0)
    sys.exit(main())
