---
name: CSS @import order
description: PostCSS requires Google Fonts @import url() to be the absolute first line before @import "tailwindcss"
---
Any @import url('https://fonts.googleapis.com/...') must be the very first line of index.css, before @import "tailwindcss" and all other imports. PostCSS will fail silently (or with a hard error) if a url() import comes after a CSS layer import.

**Why:** PostCSS processes CSS @imports in order and the Tailwind plugin processes @import "tailwindcss" as a special directive. Any standard CSS url() import after it violates the CSS spec rule that @import must precede all other statements.

**How to apply:** Always place font @import url(...) as line 1, then @import "tailwindcss", then other @import plugin lines.
