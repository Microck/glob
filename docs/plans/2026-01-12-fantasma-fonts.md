# fantasma fonts implementation plan

> **for claude:** required sub-skill: use superpowers:executing-plans to implement this plan task-by-task.

**goal:** add fantasma font and decide which existing fonts to replace.

**architecture:** load fantasma from `public/fonts/fantasma` via `@font-face`, then map it to `font-display` and or `font-ui` in tailwind config and base css. remove google font requests only after replacement is confirmed.

**tech stack:** vite, react, tailwind, plain css.

### task 1: inventory current font usage

**files:**
- modify: `tailwind.config.ts:55-58`
- modify: `src/index.css:43-63`
- modify: `index.html:77-79`

**step 1: write the failing test**

no automated tests in repo. skip. use manual check.

**step 2: run test to verify it fails**

run: `npm run dev`
expected: current fonts are syne and chakra petch.

**step 3: write minimal implementation**

review where `font-display` and `font-ui` are used. record areas that are header heavy vs ui heavy.

**step 4: run test to verify it passes**

run: `npm run dev`
expected: no visual change yet. this is just inventory.

**step 5: commit**

skip. user did not request commit.

### task 2: define replacement options

**files:**
- modify: `docs/plans/2026-01-12-fantasma-fonts.md`

**step 1: write the failing test**

no automated tests. skip.

**step 2: run test to verify it fails**

n/a

**step 3: write minimal implementation**

define options:
- option a: replace `font-display` with fantasma, keep `font-ui` as chakra petch.
- option b: replace `font-ui` with fantasma, keep `font-display` as syne.
- option c: add new `font-fantasma` class for hero only, keep both existing fonts.

**step 4: run test to verify it passes**

n/a

**step 5: commit**

skip. user did not request commit.

### task 3: implement chosen option

**files:**
- modify: `tailwind.config.ts:55-58`
- modify: `src/index.css:43-63`
- modify: `index.html:77-79`

**step 1: write the failing test**

no automated tests. skip. use manual check.

**step 2: run test to verify it fails**

run: `npm run dev`
expected: old fonts still active.

**step 3: write minimal implementation**

update tailwind font families and base body font to use fantasma where needed. remove google font link for any font fully replaced.

**step 4: run test to verify it passes**

run: `npm run dev`
expected: headings or ui text render with fantasma, no layout break.

**step 5: commit**

skip. user did not request commit.

### task 4: document font license location

**files:**
- modify: `docs/plans/2026-01-12-fantasma-fonts.md`

**step 1: write the failing test**

no automated tests. skip.

**step 2: run test to verify it fails**

n/a

**step 3: write minimal implementation**

add note: license at `public/fonts/fantasma/LICENSE`.

**step 4: run test to verify it passes**

n/a

**step 5: commit**

skip. user did not request commit.

**unresolved questions**
- which slot should fantasma take. display, ui, or new hero-only class
- ok to remove google fonts link once replaced
