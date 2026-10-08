---
name: fskill
description: Build or restyle React web frontends so they look and feel like a genuine Microsoft 365 web app, using Fluent 2 and Fluent UI React v9 (@fluentui/react-components). Use for any web UI, page, component, or app work in React, or when the user mentions Fluent, Microsoft style, or a professional look.
---

# fskill

Build the UI with Fluent UI React v9 and the Fluent 2 design language, so the app passes for a Microsoft 365 web app. Build exactly the features the user asked for. Fluent changes how the app looks and behaves, not what it does.

## Start from the templates

1. Install `@fluentui/react-components` and `@fluentui/react-icons` if the app lacks them. Add no other UI, CSS, icon, font, or animation library.
2. Copy every file in [templates/](templates/) into the app at `src/fskill/`. Edit the copies when the app needs it.
3. Render the app inside `Root`. It sets up `FluentProvider` with `webLightTheme` or `webDarkTheme` from the system setting. Never pass `className` or `style` to `FluentProvider`, because Fluent copies them onto every tooltip, menu, and toast layer.
4. Build every view inside `AppShell`. It draws the 48 px suite header with a brand tile, the page background, the page title, an optional left `NavDrawer`, and the `Toaster`.
   - `appName` is the product, such as "Northwind Tasks". `title` names the view, such as "My tasks" or "Team members". Never use the same words for both.
   - `appIcon` is a 20 px icon from `@fluentui/react-icons` that fits the product, such as `TaskListLtr20Regular`.
   - `width` is `"table"` for data tables, `"list"` for lists and card grids, and `"form"` for settings and forms. The column is centered.
   - Pass `userName` with a realistic name for any app a person signs in to, which includes task, settings, and admin apps.
   - Pass `search` when the user asked for search or the view is a table of records. It filters that list by name, title, or email, and it is the only search on the page. A short list such as a todo list and a settings page get no search.
   - Put the page's main action, such as **Invite member**, in `titleActions`. Use `description` for one short sentence under the title only when the title alone is unclear.
   - Pass `sections` for the app's views. Use them when the app has two or more separate areas, such as Inbox and Calendar, and for the views of a personal list, such as All, Active, and Completed tasks, the way Microsoft To Do does. Give each list view a `count`. The page title is the selected view's name.
   - A settings page with three or more groups, such as Profile, Notifications, and Appearance, also uses `sections`, one group per view. **Save** and **Discard** in `titleActions` cover every group, and stay disabled until something changes.
   - Section icons are 20 px icons, such as `Person20Regular`.
5. Show a table of records with `DataTable`. On phones it turns into a stacked list by itself. Mark columns a phone user can skip, such as a last-active date, `secondary`. Mark amounts and counts `numeric` and put them last. Mark the column with the longest values, often the email or description, `wide`. Keep cell text regular weight.
6. Show `EmptyState` when a view has no items or no search results.

## Use the component, not a copy of it

Every control comes from `@fluentui/react-components`. Never render a raw `<button>`, `<input>`, `<select>`, `<textarea>`, or `<h1>`.

| Need | Use |
| --- | --- |
| Action | `Button`. One `appearance="primary"` per view. Others default, `subtle`, or `transparent`. |
| Icon-only action | `Button` with `icon`, `appearance="subtle"`, and `aria-label`, inside `Tooltip` with `relationship="label"` |
| Text entry | `Input` or `Textarea` inside `Field` with a `label` |
| Quick-add row, such as "Add a task" | `Input` with `aria-label`, a placeholder, and `contentBefore={<Add20Regular />}`, no visible label, then a primary `Button` with no icon. The button never shrinks or wraps. |
| Search | The `search` prop of `AppShell`. Use a page `SearchBox` only inside a dialog or panel. |
| On or off setting | `Switch` with its `label`, which sits to the right of the toggle. Add no helper text unless the label alone is unclear. |
| Setting that depends on another | Put it right under the setting it depends on, indented by `spacingHorizontalXXL`, and disable it when the parent is off |
| One choice of a few | `RadioGroup` with `Radio` |
| One choice of many | `Dropdown` with `Option` |
| Mark an item done | `Checkbox` with `shape="circular"` for tasks. Wrap it in an element with `flexGrow: 1`, so the row's actions line up on the right edge. Color an open item's label `colorNeutralForeground1`, because the default label is gray. |
| Filter a table of records | `TabList` with `Tab` above the table, such as All, Owners, Admins, and Members. A personal list's views go in `sections` instead. Never show the same filter in both places. |
| Commands for a list or table | `Toolbar` with `ToolbarButton` |
| More actions on a row | `Menu` with `MenuTrigger`, `MenuPopover`, `MenuList`, and `MenuItem` |
| Content surface | `Card`. Keep its default look. |
| Totals or summary figures | A row of `Card`s in a CSS grid with `gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'`, so phones get two per row. Each card shows a `Caption1` label and a `Subtitle1` value, and nothing else. |
| Table of records | The `DataTable` template |
| Simple list | `List` with `ListItem`, or rows of `Card` content |
| Status | `Badge` with `appearance="tint"`. Use `color="success"` for active or done, `"warning"` for pending, `"danger"` for blocked, suspended, or failed, and `"informative"` for invited or new. Use `"subtle"` for categories, so color stays for status. |
| Person | `Avatar` or `Persona` |
| Inline message or error | `MessageBar` with `MessageBarBody` |
| Result of an action | A toast sent with `useToastController().dispatchToast`. Write it as `<Toast><ToastTitle action={<Link onClick={undo}>Undo</Link>}>Task deleted</ToastTitle></Toast>`, so the title and the action share one line. |
| Confirm an action that cannot be undone | `Dialog` with `DialogSurface`, `DialogBody`, `DialogTitle`, `DialogContent`, and `DialogActions` |
| Form in a dialog | `Dialog` with a `<form>` between `DialogSurface` and `DialogBody` |
| Loading | `Spinner` for an action, `Skeleton` with `SkeletonItem` for content |

Use each component's own props (`appearance`, `size`, `shape`, `icon`) before writing styles for it.

## Style with tokens only

Write styles with `makeStyles` and merge them with `mergeClasses`. Every color, space, radius, shadow, font, and duration is a `tokens.*` value.

- No hex, `rgb()`, or named colors. No gradients, `.css` files, inline `style`, or Tailwind.
- Raw px is only for layout sizes such as `maxWidth` and `height`. Spacing uses the ramp. `spacingHorizontal` and `spacingVertical` go `XXS` 2, `XS` 4, `SNudge` 6, `S` 8, `MNudge` 10, `M` 12, `L` 16, `XL` 20, `XXL` 24, and `XXXL` 32 px.
- Group with space. Use `S` to `M` inside a group and `XL` to `XXL` between groups. Add a `Divider` only when space cannot show the grouping.
- Corners are `borderRadiusMedium` (4 px) for controls, rows, and cards. Use `borderRadiusCircular` only for avatars and pills.
- Resting surfaces get a `Card`, or `colorNeutralBackground1` with a 1 px `colorNeutralStroke2` border. Leave `shadow16` and up to menus and dialogs, which already have them.
- Text is `colorNeutralForeground1`. Use `colorNeutralForeground2` for secondary text and `colorNeutralForeground3` for hints and done items. Brand color marks the primary action and the selected item only.
- A row's hover color is `colorSubtleBackgroundHover`, and it fills the row inside the surface's edges. Keep the same inset on both sides of a row.
- Let components animate themselves. Add no other motion.

## Set type with the ramp

Use the typography components. Fluent sets the font through `FluentProvider`, so never import or name a font.

| Role | Component |
| --- | --- |
| Page title, one per view | `Title3 as="h1"`, already in `AppShell` |
| Section heading | `Subtitle2 as="h2"` |
| Body, list, and table text | `Body1` |
| Emphasis | `Body1Strong` |
| Metadata and hints | `Caption1` |

## Use Fluent System Icons

- Import icons from `@fluentui/react-icons`, such as `AddRegular`, `DeleteRegular`, and `PersonAddRegular`. Never use emoji.
- Use `Regular` icons. Use `Filled` only for a selected or on state, through `bundleIcon(StarFilled, StarRegular)`.
- Let `Button` size its icon. Elsewhere use 20 px icons, such as `Mail20Regular`.

## Handle every state

- Empty: `EmptyState` with a short title, one sentence, and the action that fills the view.
- Loading: `Skeleton` in the shape of the content.
- Error: `MessageBar` with `intent="error"` and a way to retry. Put field errors on `Field` with `validationState="error"` and `validationMessage`.
- Delete one item at once, then show a toast with an **Undo** action. Use a confirm `Dialog` only for an action that cannot be undone.
- Disable an action that would lock the user out, such as removing their own account or the last owner, and say why in its `Tooltip`.
- After a save, show a toast such as "Settings saved". Keep the form on screen.
- Every action works from the keyboard. Enter submits a one-field form.
- Below 640 px wide, buttons keep their natural width. Rows may wrap.

## Write like Microsoft

- Use sentence case for every title, button, tab, column, and menu item: "Add task", not "Add Task".
- Start each button and menu label with a verb: "Add task", "Invite member", "Save".
- Keep labels to 1 to 3 words. Labels, placeholders, and tooltips take no period.
- Say each fact once. If a tab shows "Active 3", don't also write "3 tasks left". Don't repeat a profile's name and email above the fields that hold them. Don't put a badge on a card whose title already says the same thing.
- Address the user as "you". No exclamation marks, emoji, or jokes. Don't write "successfully".

## Avoid the generic AI look

None of these appear in a Fluent app:

- Gradients, glass blur, glow, colored shadows, or a purple accent.
- Corners rounder than 4 px on a rectangle.
- A lone card centered on a large empty page.
- Imported fonts, emoji, or all-caps labels.
- Progress rings, stats panels, stars, categories, sorting, export, dates, or greetings the user did not ask for.
- The Microsoft logo, the words Microsoft 365, or a waffle button that does nothing. The app is its own product.
- Animation on load or hover lift on cards.

## Check before you finish

1. From the app root, run `node <this skill's directory>/scripts/check.mjs src`. Fix every problem it prints, and run it again until it passes. Read each warning and fix it unless the words are a proper noun.
2. Build the app and fix every type error.
3. If you can open the app in a browser, hover an icon button and trigger a toast. The page must stay visible behind them.
4. Use the app with the keyboard only. Every action works, and focus is visible.
5. Remove all items and check the empty state.
