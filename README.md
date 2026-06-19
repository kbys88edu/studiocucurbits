# Studio Cucurbits. standalone page

This folder contains a static, standalone-ready version of the Studio Cucurbits. page.

## Files

- `index.html` - page structure, bilingual copy, SEO/Open Graph metadata, and schema data.
- `styles.css` - responsive visual design.
- `script.js` - Japanese/English/French language toggle with local preference storage.

## Source basis

The draft uses the current Studio Cucurbits. page as the base, then expands it for a standalone studio site with clearer service descriptions, an explicit AI position, process, contexts, collaborator information, and inquiry flow.

Public links referenced in the page:

- https://www.sachiekobayashi.com/cucurbits/
- https://www.sachiekobayashi.com/
- https://frederik.bous.cc/
- https://www.impuls.cc/archivvor22/en/competition/composers-for-2023.html
- https://ressources.ircam.fr/en/media/x56d2a9_day-0-trans-instrumentalism-sachie-kobayas
- https://www.lefresnoy.net/en/exposition/2207/oeuvre/2256/

## Deployment note

This can be uploaded as a normal static site. For a future independent domain, update the `url` field in the JSON-LD block and the Open Graph metadata in `index.html`.
