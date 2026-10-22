# Nathan Lin — Portfolio

Personal portfolio site for Nathan Lin, Technical Program Manager and Product Builder based in Toronto.

Plain HTML, CSS and JavaScript with no build step or dependencies.

## Structure

```
index.html        page content
css/tokens.css    design tokens (colors, type, spacing, motion, dark mode)
css/styles.css    layout and components
js/main.js        headline reveals, live clock, theme toggle, drag-to-scroll
assets/           portrait and client logos
```

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy with GitHub Pages

In the repository, go to **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save. The site will be live at `https://<username>.github.io/<repo>/`.

## Notes

- The case studies section is hidden for now. Remove the `hidden` attribute on `<section class="cases">` in `index.html` to show it.
- Client logos come from [Simple Icons](https://simpleicons.org), Wikimedia Commons and klick.com. They are trademarks of their respective owners.
