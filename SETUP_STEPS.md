# Chest Pain Delphi — Setup in 5 Minutes

The platform is now fully self-contained. No Google Forms, no Apps Script, no CSVs to publish. Members vote directly in the platform; their browser generates a submission code; they email the code to you; you paste codes into the Admin tab; the scatter plot and tables populate automatically.

**You do the 3 steps below once.** After that you only share the URL.

---

## Step 1 — Create a free GitHub account (skip if you already have one) — 2 min

1. Open a browser tab. Go to **https://github.com**.
2. Click **Sign up** (top-right).
3. Enter your email — either `tehreem.rehman@mountsinai.org` (work) or any personal email works for the GitHub account itself.
4. Create a password. Pick a username — whatever you want, lowercase, no spaces. Example: `tehreemr`. Write this username down.
5. Verify your email when GitHub asks.
6. When it asks "How many team members?" pick **Just me**. When it asks about features pick **Free**. Click **Continue**.

---

## Step 2 — Upload the 2 files to GitHub — 2 min

1. Still signed in to **https://github.com**. Click the green **New** button (top-left, next to "Top Repositories"). If you don't see it, click the **+** icon top-right → **New repository**.
2. **Repository name:** type `chestpain-delphi` (lowercase, with the hyphen, exactly).
3. Leave everything else as default. **Public** is fine. Do **not** check "Add a README file".
4. Click the green **Create repository** button at the bottom.
5. On the next page you'll see "Quick setup" instructions — ignore those. Look for the link that says **uploading an existing file** (it's in the middle of the page, in the "…or create a new repository on the command line" section). Click it.
6. You now see a gray box labeled *Drag files here to add them to your repository*.
7. In a Finder window, navigate to `Desktop/Front End Care Standardization/ChestPain_Delphi/`.
8. Select **both** of these files (hold Cmd and click each):
   - `index.html`
   - `ED_ChestPain_Dashboard.html`
9. Drag them into the gray box on the GitHub page.
10. You'll see both filenames listed under the box. Scroll down and click the green **Commit changes** button.

Done. The files are now on GitHub.

---

## Step 3 — Turn on GitHub Pages (the free web host) — 1 min

1. At the top of the repository page, click the **Settings** tab (far right of the tab row).
2. On the left sidebar, click **Pages**.
3. Under *Build and deployment → Source*, click the dropdown that says **None** and change it to **Deploy from a branch**.
4. Just below that, there's a row with two dropdowns. Set:
   - Left dropdown (Branch): **main**
   - Right dropdown (Folder): **/ (root)**
5. Click the **Save** button.
6. Wait ~60 seconds. Refresh the page (Cmd+R).
7. Near the top of the Pages page, a green box will appear that says **Your site is live at** followed by a URL that looks like:

   `https://YOUR-USERNAME.github.io/chestpain-delphi/`

8. **Copy that URL.** That's the platform link you share with the task force.
9. Click the URL to open it. You should see a navy sign-in screen asking for an access code. Type `MSCHESTPAIN2026` and press Enter.
10. You should now see the platform. Click through the tabs to make sure the Data Dashboard loads.

**If the URL shows a 404:** wait another minute and refresh. GitHub Pages takes 30-90 seconds the first time.

---

## Step 4 — Send the platform to the task force

Copy-paste this email:

> **Subject:** Chest Pain Order Set — Round 1 voting (15 min)
>
> Team — Round 1 of our modified Delphi is open through **[DATE]**.
>
> **Platform:** `https://YOUR-USERNAME.github.io/chestpain-delphi/`
> **Access code:** `MSCHESTPAIN2026`
>
> **How to vote:**
> 1. Open the link, type the access code.
> 2. Start on the **Data Dashboard** tab to ground your ratings, then on **Overview** read the method summary.
> 3. Go to **R1 Rating**. Type your name, then click the pills (1-5) for Effort, Impact, and Interest on each of the 24 initiatives. Leave a comment where you dissent.
> 4. When done, click **Generate submission code** then **Email to Tehreem** (opens your mail app pre-filled — just press Send). If the button doesn't open your mail app, click **Copy to clipboard** and paste into a fresh email to me.
> 5. You can re-open the link anytime before the deadline and regenerate a new code. Latest submission wins.
>
> — Tehreem

---

## When you're ready to see results

### After members send you their codes

1. Open the platform. Click the **Admin** tab → password `admin-chestpain-2026`.
2. Under *Round 1 submissions*, paste all the codes you've received (one per line). It's OK if you paste the whole email body — the platform extracts the `CPD1.v1.…` code from it.
3. Click **Aggregate R1 results**. You'll see *"N panelists submissions aggregated"*.
4. Under *Lock controls*, click the **Round 1 results tab visibility** toggle to **UNLOCKED**.
5. Click the **R1 Results** tab. The scatter and disagreement table are now populated.
6. Screenshot the scatter; bring to Meeting 2.

### After Meeting 2

1. Admin tab → toggle **Round 1 results** to **LOCKED** (so members vote R2 with fresh eyes on the method page), toggle **Round 2 rating** to **UNLOCKED**.
2. Resend the platform URL to the task force and ask for R2 submissions.
3. Aggregate R2 codes the same way. Unlock **Round 2 results** when ready.

---

## Backing up submissions

Because submissions are stored in **your browser** (not a server), always click **Export all submissions (.json)** on the Admin tab after each aggregation and keep the file in your ChestPain_Delphi folder. If you ever clear your browser cache, restore from that file using the Admin panel's *Restore from backup* section.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| URL gives a 404 | Pages isn't live yet | Wait 60 sec, refresh. If still 404 after 3 min, re-check Step 3. |
| Scatter plot is blank after pasting codes | Results tab still locked | Admin → toggle Round 1 results to UNLOCKED. |
| "Could not find a CPD code on line" error | Paste contained no code | Make sure each member's email includes the `CPD1.v1.…` token. |
| Member lost their rating progress | They cleared browser data | They re-vote. In-progress ratings autosave only in that browser. |
| *Email to Tehreem* button does nothing | Default mail app not set on that Mac | Member uses **Copy to clipboard** instead and pastes into Gmail manually. |

Questions → Tehreem.
