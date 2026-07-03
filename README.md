# C Interview Prep

All **91 programs** from `interview_all_guide_v2.md` — strings, arrays, bits, linked lists, BST, **AVL tree**, queues, parsing, drivers, and libc reimplementations.

**Live site:** https://shivaprasad2394.github.io/cursor_guide/

## How each question works

| Part | What you get |
|------|----------------|
| **Starter code** | `#include`s, struct typedefs if needed, and **`main()` only** — you write the helper functions |
| **Algorithm / trace** | From your guide |
| **Prev / Next** | Move through all 91 questions in order |
| **Load solution** | Full working program from the guide |
| **Run / Check** | In-browser Clang (no API key; ~60 MB download once) |

## Re-import after editing the guide

```bash
python3 scripts/import_guide.py
```

Reads: `/home/shivaprasad/chandu/husband/lord_claude/interview_all_guide_v2.md`  
Writes: `questions/*.md` + `questions/index.json`

## Publish to GitHub Pages

Use **Deploy from a branch** (recommended for this static site). Do **not** use GitHub Actions unless you know you need it — mixed branch + Actions deploys often get stuck in `deployment_queued`.

1. Push to `main`:
   ```bash
   cd ~/Workspace/c-interview-prep
   git add .
   git commit -m "Update site"
   git push origin main
   ```

2. On GitHub: **Settings → Pages**
   - **Build and deployment → Source:** Deploy from a branch
   - **Branch:** `main` / **Folder:** `/ (root)`
   - Click **Save**

3. Disable any **custom** Pages workflow you added (Actions tab → your workflow → ⋯ → Disable).  
   Do **not** worry if you see no custom workflow — branch deploy uses GitHub’s built-in **`pages-build-deployment`** job instead.

4. Push any commit to `main` (even a README edit). Then open **Actions** and look for a run named **`pages build and deployment`** (not your old custom deploy). It should finish in ~30 seconds.

5. Wait 2–3 minutes after that run succeeds, then hard refresh the site (**Ctrl+Shift+R**).

6. Confirm deploy worked:
   - Home page shows **91 programs** and an **avl tree** section
   - Question page shows **← Previous** / **Next →**
   - Footer on a question page: **Site build: v8**

### If Pages is stuck on an old build

- Settings → **Environments** → `github-pages` → cancel any stuck deployments
- Settings → Pages → switch source to branch `main` / `(root)` and Save again.
- Avoid re-running Actions workflows while branch deploy is enabled.

The Node.js 20 deprecation warning in Actions logs is harmless and **not** why deploys fail.

## Sections (91 total)

| Section | Count |
|---------|------:|
| Strings | 13 |
| Arrays | 13 |
| Bit manipulation | 13 |
| Math / number | 8 |
| Linked list | 8 |
| Binary search tree | 7 |
| AVL tree | 4 |
| Queues & stacks | 3 |
| Parsing & formatting | 8 |
| Buffers & driver patterns | 4 |
| Memory / DMA / mmap / libc | 10 |
