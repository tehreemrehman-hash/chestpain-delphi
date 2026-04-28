# Proposed update to `delphi-survey-platform` skill

Derived from the Mount Sinai ED Front-End Care Standardization chest pain Delphi build (2026-04-21). The existing skill captures the Google-Forms architecture well but is missing two things this build exercised:

1. A **pure-local / no-Google architecture** for when OAuth is blocked or the panel is small enough for admin paste-aggregation. We hit this when shared-Gmail OAuth consent failed repeatedly; pivoting to pure-local unblocked the task force inside an hour.
2. A **multi-dimensional value-matrix scoring** mode (Effort × Impact × Interest) for implementation-priority-setting and informatics builds, which is what order-set Delphis actually need — a prioritization landscape, not a single-bin ranking.

All additions below are designed to slot into the existing skill structure without reshaping it. The skill currently lives at `/var/folders/.../claude-hostloop-plugins/.../skills/delphi-survey-platform/SKILL.md` (read-only plugin path).

---

## Change 1 — Update the frontmatter `description`

**Replace** the existing description line with:

> Build an interactive online platform for running a modified Delphi consensus process — multi-round expert voting, live results, asynchronous discussion, per-meeting materials pages, and an optional self-serve registration workflow with admin approval. Covers two data architectures: the default Google Forms + published-CSV variant (for large academic panels) and the pure-local / no-Google variant (for informatics builds, hospital IT environments where OAuth is blocked, or small working groups where an admin can handle paste-aggregation). Also covers two scoring models: classical single-scale consensus (Include/Modify/Exclude or Likert) and multi-dimensional value-matrix scoring (Effort × Impact × Interest) for implementation-priority-setting and informatics build prioritization. Use whenever the user wants to create, customize, or deploy a Delphi survey, consensus voting tool, research priority setting platform, expert panel rating system, order set prioritization, or any clinical/operational informatics build where a group needs to converge on what to build and in what order. Trigger phrases include "Delphi survey", "modified Delphi", "consensus conference", "research agenda voting", "round 1 / round 2 survey", "voting platform for our working group", "meeting materials page", "kickoff meeting page", "registration form for the working group", "let people request access", "approve new members", "value matrix", "effort impact interest", "order set prioritization", "informatics build Delphi", "which order set items to include", or any SAEM/clinical/academic consensus workgroup. Also use to clone an existing Delphi platform, swap questions/branding, add meeting agenda pages, wire up a registration form that emails new members an access code after admin approval, or pivot a stuck Google-Forms build to the pure-local architecture.

---

## Change 2 — Insert a new section right after the architecture table ("The architecture (and why)"), before "Files in this skill"

---

## Variant: Pure-local / no-Google architecture

Use this variant when any of these apply:

- The user's organization blocks Apps Script OAuth (common for hospital IT, healthcare corporate accounts, shared Gmail accounts used for clinical working groups)
- The panel is small (≤30-40) and a single admin can handle paste-aggregation per round
- The working group wants zero external dependencies — no Google account needed to vote
- You hit OAuth / permission dead-ends after 2-3 retries on the default Google-Forms path — don't keep pushing; pivot

Reference implementation: Mount Sinai ED Front-End Care Standardization chest pain Delphi, 2026-04. The pivot happened after three failed OAuth consent flows on a shared Gmail account; pure-local unblocked the task force in under an hour and removed the dependency on institutional Google Workspace entirely.

### Architecture comparison

| Concern | Default (Google Forms) | Pure-local variant |
|---|---|---|
| Data collection | Google Form per round, one submit per participant | Native in-platform voting UI — pill buttons, localStorage autosave |
| Submission transport | Form submit → Google Sheet (server-authoritative) | Browser encodes ratings into a base64url submission code → member emails code to admin |
| Aggregation | Published CSV fetched at runtime by JS, tallied in-browser | Admin pastes codes into an admin textarea; JS decodes, dedups, tallies |
| Persistent state | Google Sheet | Admin's browser localStorage + periodic JSON export backup |
| Dedup | Form's "limit 1 response" + Google account identity | Case-insensitive name match; latest `t` timestamp wins |
| OAuth / API keys needed | Yes (to deploy the Apps Scripts) | None |
| Works on `file://` | No (CORS blocks the CSV fetch) | Yes (though GitHub Pages is still cleaner) |

### Submission code format

Each member's submission is a single string:

```
CPD<round>.v1.<base64url-encoded JSON>
```

Where `<round>` is `1` or `2` and the JSON payload is:

```json
{
  "n": "Jane Clinician",
  "r": 1,
  "t": 1729876543210,
  "v": [
    { "i": 1, "E": 3, "I": 4, "T": 5, "c": "Optional comment" },
    { "i": 2, "E": 2, "I": 3, "T": 4 }
  ]
}
```

Field reference:
- `n` — member name (used for dedup across rounds)
- `r` — round number
- `t` — Unix ms timestamp at code-generation time (latest wins on dedup)
- `v[]` — one rating object per initiative:
  - `i` — initiative id
  - rating fields — depends on the scoring model (classical Delphi: one rating; value-matrix: `E`, `I`, `T`)
  - `c` — optional free-text comment

`.` is the separator between schema prefix and payload because base64url alphabet is `A-Z a-z 0-9 - _` — `.` is unambiguous. Use `CPD` or your own project shortcode; the prefix lets the admin paste a whole email body and have a regex find the code.

Typical code length: ~900-1000 characters for 24 items × 3 dimensions. Fits in a single email body line.

### Platform flow

Member voting:
1. Opens platform URL → types access code
2. Rates each initiative on the rating tab; ratings autosave to localStorage as they click
3. Clicks **Generate submission code** → JS base64url-encodes the state into `CPD1.v1.…`
4. Clicks **Email to [admin]** → opens `mailto:` pre-filled with subject + body containing the code. Falls back to **Copy to clipboard** if the mail app integration is missing (common on corporate Macs where default mail app isn't set).

Admin aggregation:
1. Admin receives emails. Some members paste the code inline in the body, some as a subject line — the regex `/CPD[12]\.v1\.[A-Za-z0-9_\-]+/g` handles both.
2. Admin opens platform → **Admin** tab → password-gated
3. Pastes codes (one per line, or an entire email body) into the admin textarea
4. Clicks **Aggregate R1 results** → JS decodes, dedups by `(case-insensitive-name, round)` keeping latest `t`, tallies mean/SD per initiative per dim, persists to localStorage
5. Toggles R1 results tab to UNLOCKED → scatter + disagreement table render from the aggregated state

Round 2:
- Round 1 ratings auto-prefill into Round 2 cards so members revise rather than re-rate from scratch
- Same paste-and-aggregate flow, different round prefix (`CPD2.v1.…`)
- Tabs unlock sequentially via admin controls

### Backup & recovery

localStorage is fragile — admin clears browser cache, aggregated state is gone. Three layers of defense:

1. **After every aggregation**, admin clicks **Export all submissions (.json)** and saves the file to the project folder alongside `index.html`
2. **Keep the original member emails** — each one contains the raw code and can be re-aggregated from scratch
3. **Restore workflow**: Admin tab → *Restore from backup* → paste JSON contents → **Restore**

The Export/Restore dance is the single most common thing to forget to brief the admin on. Put it in the SETUP_STEPS.md and say it out loud at handoff.

### When NOT to use pure-local

Send the user back to the default Google-Forms path if:
- **Panel > 50 members** — paste-aggregation overhead gets ugly
- **Multi-admin workflows** — localStorage is device-specific
- **Regulated data / audit trail requirements** — Google's response sheet is server-authoritative with timestamp and edit history; localStorage is not
- **Live results between rounds need to auto-update** — pure-local only refreshes when the admin clicks Aggregate
- **You need true anonymous voting** — pure-local doesn't add anonymity; it just moves authoritative storage off Google. Anonymity is a separate architectural concern.

### Quick clone recipe for pure-local variant

1. Copy the chest pain `index.html` (or a future genericized pure-local starter, TBD) to the user's workspace
2. Update the `INITIATIVES` array (or equivalent question/item array)
3. Change `CONFIG.ACCESS_CODE` and `CONFIG.ADMIN_PASSWORD`
4. Rotate brand CSS variables (`--navy`, `--teal`, `--coral`, `--gold`, `--cream`) if the user has a palette
5. Update the admin email in the **Email to [admin]** button (`mailto:...`)
6. Update rating scale and scoring model per CONFIG (see value-matrix variant below for multi-dim)
7. Create GitHub repo → upload `index.html` + any iframed dashboards → enable Pages
8. Share the URL + access code with the panel

No Apps Script deploy, no OAuth consent, no CSV publish. If a build breaks because OAuth failed, this is the fallback.

---

## Change 3 — Insert a second variant section immediately after the pure-local variant

---

## Variant: Multi-dimensional value-matrix scoring (E × I × T)

The classical modified Delphi rates each item on a single scale (`Include / Include with modifications / Exclude`, or Likert 1-5). The **value-matrix** variant rates each item on three independent axes:

- **Effort** — how much work to implement (1 = trivial, 5 = enormous)
- **Impact** — how much patient / operational benefit (1 = marginal, 5 = transformative)
- **Interest** — group enthusiasm / momentum (1 = meh, 5 = strongly motivated)

Use this for implementation-priority-setting Delphis — order set design, operational process improvement, informatics build prioritization — where the working group doesn't need to decide *whether* to do something but *in what order* and *with what resourcing*.

### Why three dimensions beat one for informatics builds

Single-scale Delphi collapses orthogonal judgments. An item that lands in "Include with modifications" might be:
- a low-effort quick win worth doing Monday
- a high-effort strategic bet worth 12 months of runway
- a low-impact fill-in worth bundling opportunistically

The single-scale tally doesn't tell you which. With E × I × T, the group converges on a shared **prioritization landscape**, not a single ranking. Meeting 2 deliberation has something concrete to look at: a scatter plot with Effort on the x-axis, Impact on the y-axis, and Interest as the bubble size.

For informatics builds specifically, this is the right shape because build queues are resource-constrained and dependency-aware. "Include" by itself tells the build team nothing; E × I × T tells them which two things to ship first, which three to schedule for next quarter, and which to bundle with adjacent work.

### Quadrant logic (tunable in CONFIG)

| Quadrant | Effort mean | Impact mean | Interpretation |
|---|---|---|---|
| **Quick Win** | ≤ 2.5 | ≥ 3.0 | Prioritize immediately |
| **Strategic Bet** | > 2.5 | ≥ 3.0 | Plan, resource, longer horizon |
| **Fill-in** | ≤ 2.5 | < 3.0 | Bundle opportunistically |
| **Reconsider** | > 2.5 | < 3.0 | Drop or redesign |

Bubble size = Interest mean. A Quick Win with low Interest may look like the math says "go" but the team's heart isn't in it — flag for wrap-meeting discussion before committing resources. Conversely, a Strategic Bet with high Interest has implementation momentum and is a strong candidate for a dedicated build stream.

### Convergence rule

Classical Delphi convergence is a single-dim threshold (≥80% in one bin). The value-matrix equivalent:

> An item is **CONVERGED** if the panel's standard deviation is ≤ 0.75 on all three dimensions simultaneously. Otherwise it flags **ADJUDICATE** — discuss at the wrap meeting.

0.75 works well for a 1-5 scale and panels of 8-15. Tune per group. Composite SD (mean of the three per-dim SDs) is a useful sort key for the disagreement table.

### Implementation notes

- Render as three parallel pill grids per item (one per dim) with clear labels and colored dots (`.d-dot` pattern) so panelists don't lose track of which dim they're rating
- Per-rating storage: `{ i, E, I, T, c }` — matches the submission-code format above
- Tally: mean + SD per dim per item across the panel
- Results view: scatter plot + disagreement table (items sorted by composite SD, descending) + quadrant classification table
- Round 2 pre-fill: all three dim values from Round 1, so members revise only where deliberation changed their view
- Comments are per-item and per-round, retained across the dedup step so the admin can read rationale alongside the scores

### Method-page copy for panelists

A short paragraph on the platform's Method tab reduces scale-interpretation drift:

> Rate each candidate initiative on **Effort** (how much work to build, 1=trivial to 5=enormous), **Impact** (how much benefit to patient care or operations, 1=marginal to 5=transformative), and **Interest** (your personal enthusiasm for doing it, 1=meh to 5=strongly motivated). Rate independently — an initiative can be high-effort and high-impact, or low-effort and low-impact. Comments welcome on anything you feel strongly about; we surface these alongside the tallies at Meeting 2.

---

## Change 4 — Additions to "Common pitfalls and how to handle them" section

Add these entries:

**Pure-local: paste extraction fails on some codes** → regex is `CPD[12]\.v1\.[A-Za-z0-9_\-]+`. If the project uses a different prefix or a 3rd round, widen accordingly. Test with whole-email paste (headers + quoted reply + signature block + code) to confirm extraction survives gmail/outlook reformatting.

**Pure-local: admin lost all aggregated data** → localStorage cleared. Recovery: pull the original member emails, paste all codes again, re-aggregate. Prevention: export JSON after every aggregation and commit it to the project repo or workspace folder. Brief the admin on this at handoff — it is the single most common operational failure mode.

**Pure-local: mailto button does nothing** → default mail app not set on the member's machine (common on corporate Macs). Fall back: **Copy to clipboard** + paste into whatever mail client they actually use (Gmail web, Outlook web). Document this in the member-facing email as "if the Email button doesn't work, use Copy to clipboard."

**Pure-local: member reports progress lost** → autosaves are keyed to the device's localStorage. Switching browsers or clearing cache mid-round wipes in-progress ratings. They re-vote from the last aggregated snapshot (if any) or from scratch. Not a bug, but worth calling out in the member email.

**Value-matrix: scatter is a line instead of a cloud** → all items are clustering at the same (mean E, mean I) point. Usually means the scale isn't calibrated — anchor the Method tab with concrete examples of what `1` vs `5` looks like on each dim, specific to the project domain (e.g., "Effort 1 = change a display label; Effort 5 = new interface with downstream system").

**Value-matrix: one dim is all noise** → if Interest SD is 1.5 for every item, the panel isn't really using that dimension. Options: drop to two dims (E × I) for this build, or replace Interest with a more domain-specific third axis (Feasibility, Risk, Dependency count).

**Value-matrix: nobody's converging on anything** → composite SD > 1.0 across the board in Round 1 is normal — that's what Round 1 is *for*. Don't panic; the Round 2 delta is where convergence happens. Brief the working group leads on this so they don't declare the Delphi failed halfway through.

---

## Change 5 — Additions to "What this skill is NOT" section

Replace the first bullet with (or add below it):

- It is **not** exclusively Google-backed. The pure-local variant exists for environments where Google Workspace OAuth is blocked (common in hospital IT) or the panel is small enough that admin paste-aggregation is workable. Pivot to pure-local early when OAuth struggles — don't spend an hour fighting consent screens when the fallback takes 30 minutes to stand up.

Also add:

- It is **not** a single-scoring-model tool. Use classical single-scale (Include/Modify/Exclude or Likert) for research-priority and recommendation-consensus Delphis. Use value-matrix (E × I × T) for implementation-priority and build-queue Delphis. Mixing them in one platform works but needs explicit Method-tab copy explaining which questions use which scale.

---

## Change 6 — Update "Quick start: cloning for a new working group"

Add a branch for pure-local:

If the user is doing an **informatics build Delphi** or hits OAuth issues on the default path, pivot to the pure-local variant:

1. Copy the pure-local reference `index.html` to their workspace (TBD: add `assets/index_local.html` to this skill — currently the reference lives in the Mount Sinai chest pain project)
2. Update the `INITIATIVES` array with their items
3. Change `CONFIG.ACCESS_CODE`, `CONFIG.ADMIN_PASSWORD`, brand variables, and the mailto admin address
4. Pick scoring model: classical (edit the rating loop to match their scale) or value-matrix (keep E × I × T, update dim labels/cuts if needed)
5. Create GitHub repo → upload `index.html` + any iframed dashboards → enable Pages
6. Share URL + access code with the panel
7. Brief the admin on the JSON export workflow — most important operational detail

No Google Forms, no Apps Script, no OAuth.

---

## Suggested follow-up for the skill

Future maintainers should add these files to the skill's `assets/` directory:

- `assets/index_local.html` — genericized pure-local starter, derived from the chest pain `index.html`. Placeholders for items, branding, config. ~1500 lines.
- `assets/build_references_from_pmids.py` — the PMID-first citation generator referenced in Phase 7.5 ("a `build_references.py` generator that takes a list of PMIDs and emits `<div class="reference-item">` blocks would eliminate this class of error entirely").
- `references/pure-local-architecture.md` — deeper reference on the submission-code format, localStorage schema, regex extraction patterns, and the Export/Restore JSON workflow.
- `references/value-matrix-scoring.md` — deeper reference on the three-axis rating UI, quadrant cut-off tuning, convergence-SD threshold calibration for different panel sizes.

These can come from the chest pain implementation — the code is already battle-tested; it just needs to be genericized and re-filed under the skill.

---

## Origin

Built during the 2026-04-21 Mount Sinai ED chest pain Delphi build. The OAuth failure → pure-local pivot saved the working group roughly a week of delay and is worth folding into the skill so the next user hits it as "Variant B" rather than as a surprise failure mode.
