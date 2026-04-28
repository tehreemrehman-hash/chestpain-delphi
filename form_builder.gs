/**
 * ED Chest Pain — Multidimensional Delphi Form Builder
 * -----------------------------------------------------
 * Generates Round 1 and Round 2 Google Forms for the 24-initiative
 * chest pain order-set Delphi, with exactly the column structure the
 * platform's tally() function expects:
 *
 *   Col 1         : Timestamp (automatic)
 *   Col 2         : Email (automatic)
 *   Cols 3..N     : For each initiative i in 1..24:
 *                     Col (3 + 4*(i-1) + 0) = Effort rating     (1-5)
 *                     Col (3 + 4*(i-1) + 1) = Impact rating     (1-5)
 *                     Col (3 + 4*(i-1) + 2) = Interest rating   (1-5)
 *                     Col (3 + 4*(i-1) + 3) = Optional comment
 *   Last col      : General comment
 *
 * This matches CSV_FIRST_INITIATIVE_COL = 2 and CSV_COLS_PER_INITIATIVE = 4
 * in index.html (0-indexed, so col 2 = the first rating column).
 *
 * HOW TO RUN:
 *   1. Go to script.google.com → New project.
 *   2. Paste this file in.
 *   3. Run buildRound1()  — approve OAuth when prompted.
 *   4. Run buildRound2().
 *   5. Check the Execution Log for the form URLs + response sheet URLs.
 *   6. Publish each response sheet: File → Share → Publish to web → CSV.
 *   7. Paste the form URLs and CSV URLs into index.html CONFIG block.
 */

// ---------- 24-INITIATIVE CATALOG ----------
// Kept in sync with INITIATIVES in index.html.
const INITIATIVES = [
  // ----- Order Set Design (13) -----
  { id: 1,  kind:"order", title:"Collapse duplicate CBC synonyms",
    anchor:"Baseline catalog has 2 CBC+Plt+Diff synonyms (7,671 Rank 1 orders). Providers pick inconsistently; no clinical difference." },
  { id: 2,  kind:"order", title:"Remove CMP from default (BMP-only in set)",
    anchor:"System Rank 1 CMP rate elevated vs. Main ED (1.2%). BMP usually sufficient for undifferentiated chest pain." },
  { id: 3,  kind:"order", title:"Coagulation study rationalization (ACEP71)",
    anchor:"~4,500 coag orders Rank 1 system-wide. Most chest pain patients meet zero ACEP71 exclusions — direct overuse." },
  { id: 4,  kind:"order", title:"D-Dimer gated by PERC / Wells",
    anchor:"~1,200 D-Dimers Rank 1 system-wide; Main ED holds at 1.7% (closer to evidence target)." },
  { id: 5,  kind:"order", title:"Selective CXR with respiratory-indication prompt",
    anchor:"CXR is Rank 1 for most chest pain encounters despite limited yield in low-risk, non-respiratory presentations." },
  { id: 6,  kind:"order", title:"Pro-BNP gated on HF suspicion",
    anchor:"Pro-BNP ordered broadly despite evidence supporting selective use (known HF, dyspnea, edema)." },
  { id: 7,  kind:"order", title:"Decouple respiratory viral panel from chest pain",
    anchor:"RVP is pre-selected in some chest pain views despite no evidence base for routine chest pain." },
  { id: 8,  kind:"order", title:"Auto-deferred repeat troponin at validated interval",
    anchor:"Serial troponins ordered manually, creating variation in re-check interval (2 / 3 / 6 h)." },
  { id: 9,  kind:"order", title:"Acetaminophen PRN bundle in order set",
    anchor:"PRN analgesia ordered ad hoc, introducing delay between triage and first dose." },
  { id: 10, kind:"order", title:"Saline lock default / remove NaCl bolus as reflex",
    anchor:"NaCl bolus ordered reflexively even in stable, non-hypotensive chest pain patients." },
  { id: 11, kind:"order", title:"HEART score integrated risk-stratification gateway",
    anchor:"Risk stratification currently unstructured. HEART is evidence-based; integration would drive tier branching." },
  { id: 12, kind:"order", title:"Aspirin 325mg auto-fire for documented ACS concern",
    anchor:"ASA is Class I for suspected ACS; administration currently variable." },
  { id: 13, kind:"order", title:"NTG SL gated on BP and ACS suspicion",
    anchor:"NTG ordered without systematic BP threshold check, particularly for possible RV involvement." },

  // ----- Data Analysis (11) -----
  { id: 14, kind:"data",  title:"Encounter-level ACEP71 baseline with exclusions applied",
    anchor:"Current baseline counts coag orders but doesn't apply ACEP71 exclusions (liver disease, anticoagulants, A-fib)." },
  { id: 15, kind:"data",  title:"EKG-without-troponin cohort clinical profile",
    anchor:"~30% of chest-pain encounters get EKG but no troponin. Clinically appropriate if low-risk — but we lack the profile." },
  { id: 16, kind:"data",  title:"HEART pathway feasibility count",
    anchor:"Unknown what proportion of chest pain encounters have the EHR data elements to auto-calculate HEART." },
  { id: 17, kind:"data",  title:"Serial troponin interval analysis",
    anchor:"Repeat troponin timing unstructured. No baseline on provider variation in re-check interval." },
  { id: 18, kind:"data",  title:"Low-value ordering quantification (composite)",
    anchor:"No current aggregate measure of low-value ordering across the 24 initiatives." },
  { id: 19, kind:"data",  title:"TTFO baseline by ESI, shift, provider cohort",
    anchor:"Time to first order is a task force KPI but lacks baseline with proper risk adjustment." },
  { id: 20, kind:"data",  title:"ED LOS attribution by order pattern",
    anchor:"ED LOS is a task force KPI but drivers within chest pain cohort aren't attributed." },
  { id: 21, kind:"data",  title:"Provider-level variation map",
    anchor:"Provider ordering variation suspected but not quantified. Needed for targeted education vs. default changes." },
  { id: 22, kind:"data",  title:"Site-level variation with case-mix adjustment",
    anchor:"Main ED practices closer to evidence target on CMP and D-Dimer. Site differences may confound with case mix." },
  { id: 23, kind:"data",  title:"30-day safety signal pre-registration",
    anchor:"Prior to intervention launch, pre-register 30-day safety outcomes (MACE, readmission, mortality)." },
  { id: 24, kind:"data",  title:"Pre/post measurement design (ITS / SPC)",
    anchor:"Evaluation method not chosen. ITS or SPC controls for secular trend and random variation." },
];

const LIKERT = ["1","2","3","4","5"];

// ========================================================================
// ROUND 1
// ========================================================================
function buildRound1() {
  const form = FormApp.create("ED Chest Pain Delphi — Round 1 (Private Ratings)");

  // ---------- Top-level settings ----------
  form.setDescription(
    "Modified Delphi — Round 1. You are one of ~15 task force members. " +
    "For each of the 24 initiatives, rate three dimensions 1 (low) to 5 (high):\n\n" +
    "  EFFORT = build complexity, informatics lift, change-management burden.\n" +
    "  IMPACT = clinical + quality improvement magnitude if implemented well.\n" +
    "  INTEREST = your personal interest in leading / contributing to this work.\n\n" +
    "There are no right answers. Ratings are private in Round 1; group mean and SD " +
    "will be shared before Round 2. You can edit your response until the round closes."
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    "Thank you. Your Round 1 ratings have been recorded. " +
    "You can return to this form to edit before the round closes. " +
    "Round 2 will open after the next task force meeting."
  );

  addInitiativeItems_(form, /*showGroupMean=*/false);
  addGeneralCommentItem_(form);

  // Attach a response destination spreadsheet
  const ss = SpreadsheetApp.create("ED Chest Pain Delphi — Round 1 Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log("R1 form URL (share with task force):");
  Logger.log(form.getPublishedUrl());
  Logger.log("R1 form edit URL (admin):");
  Logger.log(form.getEditUrl());
  Logger.log("R1 responses spreadsheet (publish to CSV, paste into CONFIG.R1_CSV):");
  Logger.log(ss.getUrl());
}

// ========================================================================
// ROUND 2
// ========================================================================
function buildRound2() {
  const form = FormApp.create("ED Chest Pain Delphi — Round 2 (Informed Re-Rating)");

  form.setDescription(
    "Modified Delphi — Round 2. You have now seen the Round 1 group mean and SD for each " +
    "initiative on Effort, Impact, and Interest, and the task force has discussed the items " +
    "flagged as high-disagreement. Please re-rate each initiative in light of that discussion. " +
    "Moving toward the group is not required — but we ask you to explicitly consider it.\n\n" +
    "Same 1-5 scales for EFFORT / IMPACT / INTEREST. You may edit until the round closes."
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    "Thank you. Your Round 2 ratings have been recorded. " +
    "The final quadrant assignment and convergence report will be presented at the task force wrap meeting."
  );

  addInitiativeItems_(form, /*showGroupMean=*/true);
  addGeneralCommentItem_(form);

  const ss = SpreadsheetApp.create("ED Chest Pain Delphi — Round 2 Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log("R2 form URL:");
  Logger.log(form.getPublishedUrl());
  Logger.log("R2 form edit URL:");
  Logger.log(form.getEditUrl());
  Logger.log("R2 responses spreadsheet (publish to CSV, paste into CONFIG.R2_CSV):");
  Logger.log(ss.getUrl());
}

// ========================================================================
// HELPERS
// ========================================================================

/**
 * Adds 24 repeating blocks to the form. Each block = 1 initiative and produces
 * exactly 4 response columns: Effort, Impact, Interest, Comment.
 *
 * We use a GridItem with 3 rows (Effort/Impact/Interest) × 5 columns (1..5)
 * because a GridItem serializes to one column per row in the response sheet —
 * this gives us the deterministic 4-column-per-initiative layout the tally
 * function relies on (Grid = 3 cols, paragraph comment = 1 col, total = 4).
 *
 * @param {GoogleAppsScript.Forms.Form} form
 * @param {boolean} showGroupMean — Round 2 only. If true, note the group mean in the description
 *                                  (you fill in the actual numbers once R1 closes — see placeholder).
 */
function addInitiativeItems_(form, showGroupMean) {
  INITIATIVES.forEach((init, idx) => {
    // Section break every 6 items to break up visual fatigue
    if (idx % 6 === 0) {
      form.addSectionHeaderItem()
          .setTitle("Initiatives " + (idx + 1) + "–" + Math.min(idx + 6, INITIATIVES.length))
          .setHelpText(init.kind === "order"
            ? "These are ORDER SET design changes (build or CDS work)."
            : "These are DATA ANALYSIS items (baseline, evaluation, or insight work).");
    }

    const prefix = "[" + pad_(init.id) + "] ";
    const kindLabel = (init.kind === "order") ? "ORDER" : "DATA";

    const helpText =
      kindLabel + " · " + init.anchor +
      (showGroupMean
        ? "\n\n— Round 1 group mean was shown in the platform. Re-rate with that in mind. —"
        : "");

    // --- The Grid: 3 rows × 5 cols → serializes as 3 columns in the sheet ---
    form.addGridItem()
        .setTitle(prefix + init.title)
        .setHelpText(helpText)
        .setRows(["Effort (build lift)", "Impact (clinical/QI)", "Interest (personal)"])
        .setColumns(LIKERT)
        .setRequired(true);

    // --- The comment: serializes as 1 column in the sheet ---
    form.addParagraphTextItem()
        .setTitle(prefix + "Optional comment on this initiative")
        .setHelpText("Anchor your rating. Especially useful if you're an outlier from the group.")
        .setRequired(false);
  });
}

function addGeneralCommentItem_(form) {
  form.addSectionHeaderItem()
      .setTitle("Overall comments")
      .setHelpText("Anything for the task force that doesn't fit on a single initiative?");

  form.addParagraphTextItem()
      .setTitle("General comments for the group")
      .setRequired(false);
}

function pad_(n) {
  return (n < 10) ? ("0" + n) : String(n);
}

// ========================================================================
// OPTIONAL: Rebuild both in one click
// ========================================================================
function buildBothRounds() {
  buildRound1();
  buildRound2();
}
