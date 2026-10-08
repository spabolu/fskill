# fskill

fskill is an agent skill that makes your coding agent build React web apps that look like Microsoft 365 apps. Add it to [OpenCode](https://opencode.ai/), then ask for an app as you normally would. The agent builds the app with [Fluent UI React v9](https://react.fluentui.dev/) (`@fluentui/react-components`) and follows the layout, spacing, type, and wording of Microsoft 365 web apps. It also builds only the features you asked for.

fskill is in a pilot. Read [what fskill does not do yet](#what-fskill-does-not-do-yet) before you rely on it.

## See the difference

The same agent, given the same request: "Build a todo list web app. Make it look and feel like a professional Microsoft web app."

| Without fskill | With fskill |
| --- | --- |
| ![Todo app without fskill. A decorative blue banner with a date, a progress bar, and the counts repeated three times.](docs/images/todo-without-desktop.png) | ![Todo app with fskill. A suite header with an app launcher, a left menu with counts, and one plain list.](docs/images/todo-with-desktop.png) |
| ![The same app on a phone without fskill. Only the All filter is visible, so Active and Completed cannot be reached.](docs/images/todo-without-mobile.png) | ![The same app on a phone with fskill. All tasks, Active, and Completed are tabs with counts.](docs/images/todo-with-mobile.png) |

A team admin page, from the same agent:

| Without fskill | With fskill |
| --- | --- |
| ![Team page without fskill. A banner, four stat cards, and a menu repeat the same counts.](docs/images/team-without-desktop.png) | ![Team page with fskill. Header search, role tabs, and one table. You cannot remove your own account.](docs/images/team-with-desktop.png) |

Without guidance, agents add things nobody asked for, such as hero banners, progress bars, stat cards, and the same count in three places. Their apps also often break on phones. In blind tests, apps built with fskill scored higher than apps built without it on every simple app, and broke far less often. See [How fskill was tested](docs/results.md).

## What the agent does with fskill

- Copies four starter files into your app, in `src/fskill/`:
  - `Root` sets up the Fluent theme and follows the system light or dark setting.
  - `AppShell` draws the Microsoft 365 header, the left menu, and the page title. It also has a full-width mode for mail and file apps.
  - `DataTable` shows records, supports row selection, and becomes a stacked list on phones.
  - `EmptyState` covers views with no items.
- Uses Fluent components such as `Button`, `Dialog`, `TabList`, `Toolbar`, `OverlayDrawer`, and `Toast` instead of hand-built ones.
- Styles only with `makeStyles` and Fluent `tokens`. It uses no hex colors, no CSS files, and no other UI library.
- Follows Microsoft 365 patterns. Delete shows an **Undo** toast. **Save** stays disabled until something changes. You cannot remove your own account or the last owner.
- Writes UI text in sentence case, with a verb on every button.
- Runs `scripts/check.mjs` on your code and fixes what it reports before it finishes.

fskill never adds a made-up logo. To show your logo in the header, give the agent the image and ask it to use it.

## Requirements

- OpenCode.
- A React 18 or later app. The agent adds `@fluentui/react-components` and `@fluentui/react-icons` if your app does not have them.
- Node.js, which the agent uses to run the checker.

fskill covers Fluent UI React v9 only. It does not cover Fluent UI Web Components, Fluent UI React v8, or native apps. fskill uses the [Agent Skills](https://github.com/agentskills/agentskills) format, so other tools that read that format may load it, but it is tested only in OpenCode.

## Install fskill

To use fskill in one project, copy the `skills/fskill` folder into the project at `.opencode/skills/fskill`:

```bash
git clone https://github.com/<owner>/fskill.git /tmp/fskill
mkdir -p .opencode/skills
cp -r /tmp/fskill/skills/fskill .opencode/skills/fskill
```

To use fskill in every project, copy the folder to `~/.config/opencode/skills/fskill` instead. [OpenCode skills](https://opencode.ai/v2/docs/skills/) lists the other folders that OpenCode reads.

## Use fskill

Ask for the app. The agent loads fskill when the request is about a web frontend. To make sure it loads, name it in the request:

```text
Build a todo list app. Use fskill.
```

To restyle an app you already have:

```text
Restyle this app with fskill. Keep its features and data as they are.
```

## What fskill does not do yet

- It is less proven on large workspace apps. On a mail client and an issue board, fskill builds beat builds without it. On a file manager the results were even: judges rated builds without fskill that copy OneDrive as looking more like Microsoft 365, though all of them broke on a phone. See [complex apps](docs/results.md#complex-apps).
- It does not add charts. Fluent UI React v9 has no chart components.
- It is tested with two agent models and one judge setup, on seven app prompts. Your results on other apps may differ.

## Report a problem

Open an issue in this repository. Include the request you gave the agent, the model, and a screenshot. If the checker passed but the page looks wrong, say what looks wrong. Those reports become new checker rules.

## Repository layout

| Path | Contents |
| --- | --- |
| `skills/fskill/` | The skill: `SKILL.md`, the starter files in `templates/`, and the checker in `scripts/check.mjs`. |
| `tests/check/` | Tests for the checker. Run `node tests/check/run.mjs`. |
| `eval/` | The scripts that build, check, and score apps for testing. See [eval/README.md](eval/README.md). |
| `docs/` | [How fskill was tested](docs/results.md) and the screenshots. |
| `decisions.tsv` | The log of every design decision, its reason, and its evidence. |

## Trademarks

Microsoft and Fluent are trademarks of Microsoft Corporation. fskill is an independent project, and Microsoft does not endorse or maintain it.
