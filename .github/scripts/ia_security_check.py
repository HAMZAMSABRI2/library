#!/usr/bin/env python3
"""
IA Security Check — Analyses CodeQL SARIF results using Claude API.
Exits with code 1 if critical vulnerabilities are found.
"""
import anthropic
import json
import os
import sys
from pathlib import Path


def load_findings(sarif_dir: str) -> list[dict]:
    findings = []
    for sarif_file in Path(sarif_dir).glob("**/*.sarif"):
        with open(sarif_file) as f:
            sarif = json.load(f)
        for run in sarif.get("runs", []):
            tool = run.get("tool", {}).get("driver", {}).get("name", "CodeQL")
            rules = {
                r["id"]: r.get("shortDescription", {}).get("text", "")
                for r in run.get("tool", {}).get("driver", {}).get("rules", [])
            }
            for result in run.get("results", []):
                location = (
                    result.get("locations", [{}])[0]
                    .get("physicalLocation", {})
                )
                findings.append({
                    "tool": tool,
                    "rule": result.get("ruleId", "unknown"),
                    "description": rules.get(result.get("ruleId", ""), ""),
                    "level": result.get("level", "note"),
                    "message": result.get("message", {}).get("text", ""),
                    "file": location.get("artifactLocation", {}).get("uri", "unknown"),
                    "line": location.get("region", {}).get("startLine", "?"),
                })
    return findings


def write_report(verdict: str, response: str, findings: list[dict]) -> None:
    with open("ia-security-report.md", "w") as f:
        f.write("# IA Security Report\n\n")
        f.write(f"**Verdict: {verdict}**\n\n")
        f.write("## Claude Analysis\n\n")
        f.write(response + "\n\n")
        f.write("## Raw Findings Summary\n\n")
        f.write(f"- Total findings: {len(findings)}\n")
        errors = [x for x in findings if x['level'] == 'error']
        warnings = [x for x in findings if x['level'] == 'warning']
        f.write(f"- Error level: {len(errors)}\n")
        f.write(f"- Warning level: {len(warnings)}\n")


def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("::error::ANTHROPIC_API_KEY secret is not set")
        sys.exit(1)

    all_findings: list[dict] = []
    for directory in ["sarif/php", "sarif/js"]:
        if Path(directory).exists():
            all_findings.extend(load_findings(directory))

    if not all_findings:
        print("No CodeQL findings detected.")
        write_report("PASS", "No security findings were reported by CodeQL.", [])
        print("::notice::IA Security Check PASSED — no findings")
        return

    errors = [f for f in all_findings if f["level"] == "error"]
    warnings = [f for f in all_findings if f["level"] == "warning"]

    prompt = f"""You are a senior application security engineer reviewing static analysis results for a Symfony 7 / React application.

## CodeQL Scan Summary
- Total findings: {len(all_findings)}
- Error (critical) level: {len(errors)}
- Warning level: {len(warnings)}
- Note level: {len(all_findings) - len(errors) - len(warnings)}

## Findings (up to 30 shown)
```json
{json.dumps(all_findings[:30], indent=2)}
```

## Your task
1. Determine a VERDICT using these strict rules:
   - Any finding with level "error" → **VERDICT: FAIL**
   - More than 10 "warning" level findings → **VERDICT: FAIL**
   - Otherwise → **VERDICT: PASS**

2. List the top 3 most critical issues (if any).
3. Give a one-sentence overall security assessment.

Start your response with exactly `VERDICT: PASS` or `VERDICT: FAIL` on its own line."""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    response = message.content[0].text
    verdict = "FAIL" if "VERDICT: FAIL" in response else "PASS"

    print("=" * 60)
    print("IA SECURITY ANALYSIS REPORT")
    print("=" * 60)
    print(response)
    print("=" * 60)

    write_report(verdict, response, all_findings)

    if verdict == "FAIL":
        print("::error::IA Security Check FAILED — critical vulnerabilities detected")
        sys.exit(1)
    else:
        print("::notice::IA Security Check PASSED")


if __name__ == "__main__":
    main()
