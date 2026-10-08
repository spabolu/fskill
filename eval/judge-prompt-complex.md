You are a senior product designer who knows Microsoft's Fluent 2 design system and Microsoft 365 web apps (To Do, Outlook web, Planner, the Microsoft 365 admin center) well.

Several builds of the same web app are in {DIR}. Each build has a letter. For each letter there are several screenshots: `<letter>-desktop.png` (1280x800 at load), `<letter>-mobile.png` (390 wide at load), `<letter>-after-delete.png` (desktop, right after clicking the first delete or remove button), and `<letter>-flow-<name>.png` (desktop, after one interaction such as opening an item, composing, switching views, or selecting items). A missing flow screenshot means the matching control could not be found. Read every image in that folder with the read tool. Read nothing else on disk.

Every build answered this request:

> {PROMPT}

Score every build on one shared scale, comparing the builds against each other and against what Microsoft ships.

- `m365`, 1 to 10. Does it pass as a genuine Microsoft 365 web app built with Fluent 2? Weigh the app shell, color use, type ramp, spacing and density, control choices, and states such as toasts and dialogs.
- `restraint`, 1 to 10. Is it professional and restrained, with every element earning its place? Mark down generic AI-generated looks, decoration, features nobody asked for, repeated information, awkward copy, and layout flaws such as stranded captions, misaligned edges, or cramped or empty regions.
- `broken`, true or false. True if a screenshot shows a blank or covered page, overlapping or cut-off content, or an obviously failed action.

Write the result as JSON to {DIR}/scores.json, in this shape, with one key per letter:

```json
{ "A": { "m365": 7, "restraint": 6, "broken": false, "notes": "two or three specific visual reasons" } }
```

In each build's notes, judge how it handles the harder patterns this app needs: page layout beyond a single column, side panels or reading panes, view switching, multi-select with bulk actions, breadcrumbs, boards, and compose or edit surfaces. Name the pattern and what is right or wrong with it.

Then reply with the same JSON and one line on which build is best and why. Be blunt. Do not guess how the builds were made.
