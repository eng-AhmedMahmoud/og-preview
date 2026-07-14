# og-preview

**See your social & search previews before you ship — then copy the exact meta tags.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/eng-AhmedMahmoud/og-preview/pulls)

> Live demo: https://og-preview.vercel.app

## The problem

Developers ship pages with broken or ugly social and search previews — a missing `og:image`, a title that Google truncates mid-word, a Twitter card that renders as a tiny thumbnail instead of a big image. You usually don't find out until the link is already live and looks bad in someone's feed.

**og-preview** lets you fill in your page metadata and instantly *see* how it renders as a Google search result, a Facebook / Open Graph card, an X (Twitter) card, and a LinkedIn card — then copy the exact `<meta>` tags to paste into your `<head>`. Everything runs in your browser.

## Features

- Live previews of **Google**, **Facebook / Open Graph**, **X (Twitter)**, and **LinkedIn** cards.
- X card layout respects `summary` vs `summary_large_image`.
- Google-style truncation for title (~60 chars) and description (~160 chars).
- Character counters that turn amber, then red, when you cross the truncation limits.
- Auto-generated `<meta>` tag block (`title`, description, canonical, full Open Graph + Twitter tags) with one-click **Copy**.
- Graceful image fallback when no image URL is set.
- Devya dark aesthetic, fully responsive, keyboard-accessible.
- Zero dependencies, zero build step — a single static page of vanilla JS.

## Run locally

No build, no install. Either:

```bash
# just open it
open index.html
```

or serve it statically:

```bash
npx serve .
```

## Privacy

100% client-side. Your metadata never leaves the browser — there is no backend, no analytics, no network calls beyond the Google Fonts stylesheet.

## License

[GPL-3.0-or-later](./LICENSE).

---

Built by [Devya](https://devya.dev)
