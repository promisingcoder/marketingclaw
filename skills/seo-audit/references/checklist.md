# On-page SEO audit checklist

Work through each section against the fetched HTML/DOM. Record pass/warn/fail plus the actual
text found for each item that has one.

## Title & meta

- [ ] `<title>` present, unique per page, ~50-60 characters (truncates in SERPs past ~600px).
- [ ] Primary keyword/topic appears near the front of the title, phrased naturally.
- [ ] `<meta name="description">` present, unique, ~120-158 characters, includes a reason to
      click (not just a keyword list).
- [ ] No duplicate title/description across other pages on the site (spot-check 2-3 similar
      pages if this is a templated page type).

## Headings

- [ ] Exactly one `<h1>` per page, matching the page's actual topic.
- [ ] Heading levels nest logically (no jump from `<h1>` to `<h4>`; no headings used purely for
      visual styling instead of structure).
- [ ] Headings contain real descriptive text, not just "Section 1"/"More info".

## Structured data (schema.org)

- [ ] Appropriate JSON-LD type present for the page type: `Article`/`BlogPosting` for posts,
      `Product` for product pages, `Organization`/`WebSite` on the homepage, `BreadcrumbList` for
      breadcrumb nav, `FAQPage` only if there's genuinely visible FAQ content on the page (Google
      penalizes hidden/spammy FAQ markup).
- [ ] JSON-LD validates — check for missing required fields per the schema type (e.g. `Article`
      needs `headline`, `datePublished`, `author`).
- [ ] Structured data matches visible page content (no mismatched/hidden data — this violates
      Google's structured data guidelines and can trigger a manual action).

## Internal linking

- [ ] Page is reachable from at least one other page via a normal `<a href>` (not just the
      sitemap) — orphan pages get crawled less.
- [ ] Anchor text is descriptive (not "click here"/"read more" for important links).
- [ ] Important pages (money pages, cornerstone content) are linked from high-authority pages
      like the homepage or nav, not buried 4+ clicks deep.
- [ ] No broken internal links (spot-check a sample; a full crawl is out of scope for a single
      on-page audit).

## Images

- [ ] Every meaningful `<img>` has a descriptive `alt` attribute (decorative images can have
      `alt=""`, not a missing attribute).
- [ ] Alt text describes the image content/function, not stuffed with keywords.
- [ ] Images have explicit `width`/`height` (or `aspect-ratio` in CSS) to prevent layout shift.
- [ ] Hero/above-the-fold images are reasonably sized (compressed, correctly scaled — not a
      4000px source image displayed at 400px).

## Canonical & indexability

- [ ] `<link rel="canonical">` present and points to the correct preferred URL (self-canonical
      for a unique page; points to the primary version for duplicate/parametrized URLs).
- [ ] No `<meta name="robots" content="noindex">` on a page meant to rank (check for accidental
      noindex left over from staging).
- [ ] `robots.txt` doesn't block the page's path.
- [ ] Page is in the sitemap (`/sitemap.xml`) if the site maintains one.
- [ ] URL is clean and readable (lowercase, hyphens not underscores, no unnecessary query
      params/session ids on canonical content URLs).

## Core Web Vitals pointers (see SKILL.md — no API call here)

- [ ] No obviously oversized unoptimized images.
- [ ] No render-blocking synchronous scripts in `<head>` before critical content.
- [ ] `font-display` set on custom `@font-face` declarations.
- [ ] Not an excessive number of third-party scripts/trackers on the page.

## Content quality signals (quick pass, not a full content audit)

- [ ] Content actually answers the query/intent implied by the title and target keyword.
- [ ] Reasonable depth for the topic (a 150-word page targeting a competitive term is a red flag).
- [ ] No thin/auto-generated-feeling boilerplate duplicated across many pages.
