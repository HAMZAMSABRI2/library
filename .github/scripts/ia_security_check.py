#!/usr/bin/env python3
"""
IA Security Check — analyses CodeQL SARIF + composer audit JSON
using GitHub Models API (free, uses GITHUB_TOKEN).
Exits 1 if critical vulnerabilities are found.
"""
import json
import os
import sys
from pathlib import Path

from openai import OpenAI


def load_sarif_findings(sarif_dir: str) -> list[dict]:
    findings = []
    for sarif_file in Path(sarif_dir).glob("**/*.sarif"):
        with open(sarif_file) as f:
            sarif = json.load(f)
        for run in sarif.get("runs", []):
            rules = {
                r["id"]: r.get("shortDescription", {}).get("text", "")
                for r in run.get("tool", {}).get("driver", {}).get("rules", [])
            }
            for result in run.get("results", []):
                loc = result.get("locations", [{}])[0].get("physicalLocation", {})
                findings.append({
                    "source": "CodeQL",
                    "rule": result.get("ruleId", "unknown"),
                    "description": rules.get(result.get("ruleId", ""), ""),
                    "level": result.get("level", "note"),
                    "message": result.get("message", {}).get("text", ""),
                    "file": loc.get("artifactLocation", {}).get("uri", "unknown"),
                    "line": loc.get("region", {}).get("startLine", "?"),
                })
    return findings


def load_composer_audit(audit_file: str) -> list[dict]:
    findings = []
    path = Path(audit_file)
    if not path.exists() or path.stat().st_size == 0:
        return findings
    with open(path) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return findings
    for package, advisories in data.get("advisories", {}).items():
        for adv in advisories:
            findings.append({
                "source": "composer-audit",
                "package": package,
                "cve": adv.get("cve", "N/A"),
                "title": adv.get("title", ""),
                "affected_versions": adv.get("affectedVersions", ""),
                "level": "error",
            })
    return findings


def write_report(verdict: str, response: str, sarif: list, composer: list) -> None:
    with open("ia-security-report.md", "w") as f:
        f.write("# IA Security Report\n\n")
        f.write(f"**Verdict: {verdict}**\n\n")
        f.write("## Analysis\n\n")
        f.write(response + "\n\n")
        f.write("## Findings Summary\n\n")
        f.write(f"| Source | Count |\n|---|---|\n")
        f.write(f"| CodeQL (JS) | {len(sarif)} |\n")
        f.write(f"| Composer Audit (PHP CVE) | {len(composer)} |\n")
        f.write(f"| **Total** | **{len(sarif) + len(composer)}** |\n")


def main() -> None:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("::error::GITHUB_TOKEN is not available")
        sys.exit(1)

    sarif_findings = load_sarif_findings("sarif/js")
    composer_findings = load_composer_audit("audit/php-audit.json")
    all_findings = sarif_findings + composer_findings

    if not all_findings:
        print("No security findings detected.")
        write_report("PASS", "No findings from CodeQL or composer audit.", [], [])
        print("::notice::IA Security Check PASSED — no findings")
        return

    errors = [f for f in all_findings if f.get("level") == "error"]
    warnings = [f for f in sarif_findings if f.get("level") == "warning"]

    prompt = f"""You are a senior application security engineer reviewing results for a Symfony 7 / React application.

## Scan Summary
- CodeQL (JavaScript) findings : {len(sarif_findings)}
- Composer audit (PHP CVEs)    : {len(composer_findings)}
- Total error level            : {len(errors)}
- Total warning level          : {len(warnings)}

## CodeQL Findings (up to 20)
```json
{json.dumps(sarif_findings[:20], indent=2)}
```

## Composer Audit — Known CVEs (up to 10)
```json
{json.dumps(composer_findings[:10], indent=2)}
```

## Decision rules
- Any composer audit CVE (package vulnerability)  → VERDICT: FAIL
- Any CodeQL finding with level "error"            → VERDICT: FAIL
- More than 10 CodeQL "warning" findings           → VERDICT: FAIL
- Otherwise                                        → VERDICT: PASS

Respond with:
1. `VERDICT: PASS` or `VERDICT: FAIL` on its own first line
2. Top 3 critical issues (if any)
3. One-sentence overall security assessment"""

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=token,
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    verdict = "FAIL" if "VERDICT: FAIL" in answer else "PASS"

    print("=" * 60)
    print("IA SECURITY ANALYSIS REPORT (GitHub Models — gpt-4o-mini)")
    print("=" * 60)
    print(answer)
    print("=" * 60)

    write_report(verdict, answer, sarif_findings, composer_findings)

    if verdict == "FAIL":
        print("::error::IA Security Check FAILED — vulnerabilities detected")
        sys.exit(1)
    else:
        print("::notice::IA Security Check PASSED")


if __name__ == "__main__":
    main()
