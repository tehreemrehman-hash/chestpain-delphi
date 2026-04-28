# ED Chest Pain Multidimensional Delphi — Deployment Guide

A self-contained voting platform for the Front-End Care Standardization Task Force chest pain initiative. Extends classical Modified Delphi with three-axis value-matrix scoring (Effort × Impact × Interest) so the task force converges not on a single preference but on a shared prioritization landscape.

**Architecture is pure-local.** No Google Forms, no Apps Script, no CSVs, no backend. Members vote in the platform itself. Their browser encodes the ratings into a compact submission code. They email the code to you (one-click mailto). You paste codes into the Admin tab; the scatter plot and tables populate instantly.

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The platform. Single HTML file. Access gate, 8 tabs, Mount Sinai branding, native rating UI, submission-code generator, Plotly scatter viz, disagreement & quadrant tables, embedded data dashboard, admin lock controls and paste-aggregation. |
| `ED_ChestPain_Dashboard.html` | Existing interactive baseline dashboard. Embedded as an iframe in the "Data Dashboard" tab. |
| `SETUP_STEPS.md` | Click-by-click deployment guide (3 steps, ~5 min total). Start here. |
| `README.md` | This file — architectural reference. |
| `form_builder.gs` | **Obsolete** — was the Apps Script used in the previous Google-Form architecture. Retained for history; not used by the current build. |

## Architecture at a glance

```
Member voting
  browser renders 24 vote cards → member clicks pills (1-5) × 3 dims
    → ratings autosave to localStorage
    → "Generate code" → base64url-encoded JSON → "CPD1.v1.<code>"
    → "Email to Tehreem" opens mailto: pre-filled

Admin aggregation
  paste N codes (one per line) into Admin tab
    → decode each → merge (dedup by name, keep latest by timestamp)
    → tally per initiative (mean + SD of E, I, T across panel)
    → render Plotly scatter + disagreement table + quadrant classification
```

No backend. No external services. GitHub Pages serves the HTML; everything else runs in the browser.

## Submission code format

Each member's submission is:

```
CPD<round>.v1.<base64url-encoded JSON>
```

Where `<round>` is `1` or `2` and the JSON payload is:

```json
{
  "n": "Ilana Klein",
  "r": 1,
  "t": 1729876543210,
  "v": [
    { "i": 1, "E": 3, "I": 4, "T": 5, "c": "Optional comment" },
    { "i": 2, "E": 2, "I": 3, "T": 4 },
    ...
  ]
}
```

Typical code length is ~900-1000 characters — fits in a single email body line. `.` is used as the separator because base64url uses `A-Z a-z 0-9 - _`, so `.` is unambiguous.

## Deployment

See `SETUP_STEPS.md` for the 3-step click-by-click guide. Summary: create a GitHub repo → upload `index.html` + `ED_ChestPain_Dashboard.html` → enable Pages. ~5 minutes.

## Running the rounds

### Round 1

1. Admin tab → password. Confirm *Round 1 results* is LOCKED (default). Leave R2 tabs LOCKED.
2. Share the Pages URL + access code with the task force.
3. Members vote on the **R1 Rating** tab. They hit **Email to Tehreem** when done.
4. As codes arrive: Admin tab → paste them (one per line, or even a whole email — the platform extracts `CPD1.v1.…` automatically) → **Aggregate R1 results**.
5. Export a backup (Admin → *Export all submissions (.json)*) — aggregated data lives in your browser's localStorage; the backup JSON is your safety net.
6. Unlock **Round 1 results** when you're ready to see them. The scatter + disagreement table populate.

### Between rounds

Screenshot the R1 scatter and the top of the disagreement table; bring to Meeting 2. Items with composite SD > 1.0 are the conversation targets.

### Round 2

1. Admin tab → LOCK *Round 1 results*, UNLOCK *Round 2 rating*.
2. Resend the platform URL. Members' Round 1 ratings auto-prefill into Round 2 cards — they revise only where deliberation changed their view.
3. Aggregate R2 codes the same way. Unlock *Round 2 results* when ready.

## Quadrant logic

| Quadrant | Effort | Impact | Read |
|---|---|---|---|
| **Quick Win** | ≤ 2.5 | ≥ 3.0 | Prioritize immediately |
| **Strategic Bet** | > 2.5 | ≥ 3.0 | Plan, resource, longer horizon |
| **Fill-in** | ≤ 2.5 | < 3.0 | Bundle opportunistically |
| **Reconsider** | > 2.5 | < 3.0 | Drop or redesign |

Interest scores the bubble size — a quadrant placement with high group interest has implementation momentum on its side.

**Convergence rule:** an initiative is **CONVERGED** if SD ≤ 0.75 on all three dimensions (Effort, Impact, Interest). Everything else flags **ADJUDICATE** — discuss at the wrap meeting.

## Security / access model

- **Access gate** (`MSCHESTPAIN2026` default): shared code. Good enough for an internal working group; rotate after the Delphi closes.
- **Admin password** (`admin-chestpain-2026` default): controls round lock-state toggles and aggregation. Client-side only — effective for rate-limiting well-meaning members, not a substitute for real auth.
- **Ballot integrity:** submission codes are base64-encoded JSON, not signed. A member could in principle tamper with their own ratings before copying the code. This is acceptable — the panel is trusted colleagues; the round 2 + deliberation loop catches outliers.
- **Dedup policy:** multiple codes from the same name are deduped by case-insensitive name, keeping the latest by client `t` timestamp.

## Backup & recovery

Aggregated submissions live in **your browser's localStorage** on whichever device the admin uses. This is fragile — if you clear browser data, aggregated state is gone.

**Mitigation:**
1. After each aggregation, click *Export all submissions (.json)* and save the file to this `ChestPain_Delphi` folder.
2. Keep the original member emails — each contains the raw code and can be re-aggregated.
3. To restore from backup: Admin tab → *Restore from backup* → paste the JSON contents → **Restore**.

## Adapting this template

- **Different number of initiatives:** update the `INITIATIVES` array in `index.html`. Keep the keys `id`, `kind`, `domain`, `title`, `cat`, `anchor`, `target`, `pre`.
- **Different rating scale:** change the loop bound in the `pillRow` helper inside `renderVoteCards` (currently `for (let v = 1; v <= 5; v++)`), and update `EFFORT_CUT` / `IMPACT_CUT` / `SD_CONVERGE` in the CONFIG block.
- **Different brand:** replace the CSS custom properties in `<style>` at the top of `index.html` (`--navy`, `--teal`, `--coral`, `--gold`, `--cream`).
- **Different access code / admin password:** edit `CONFIG.ACCESS_CODE` and `CONFIG.ADMIN_PASSWORD` near line 842.

---

Questions: Tehreem (Medical Director Lead) / Front-End Care Standardization Task Force.
