# Test scripts

These scripts build the same apps with and without fskill, check each build in Chrome, and prepare blind screenshot sets for a model to score. [Results](../docs/results.md) describes the method and what it found.

## Requirements

- Node.js 20 or later.
- Google Chrome. Set `CHROME_PATH` if Chrome is not at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- The shared dependencies, installed once:

	```bash
	cd eval/runtime
	npm install
	```

## Settings

| Variable | Default | Use |
| --- | --- | --- |
| `FSKILL_EVAL_DIR` | `fskill-eval` in the system temp folder | Holds the generated projects in `projects/` and the screenshot sets in `review/`. |
| `CHROME_PATH` | The macOS Chrome path | The Chrome binary the gate drives. |

## Files

| Path | Contents |
| --- | --- |
| `tasks.json` | The app prompts. Each task has an `id`, a `project` folder name, a `seeds` count, and the `prompt` a builder receives. |
| `variants/` | A frozen copy of each fskill version that was tested, such as `variants/v11`. |
| `runtime/` | The `node_modules` that every generated project links to. |
| `runs/<round>/` | Output of one round, ignored by git: `manifest.json`, `gates/`, `shots/`, and `judging/`. |
| `judge-prompt.md` | Instructions for a judge on the simple apps. |
| `judge-prompt-complex.md` | Instructions for a judge on the complex apps, which adds the interaction screenshots. |

## Scripts

### `make-workspaces.mjs`

```bash
node make-workspaces.mjs <round> <arm> <skill dir or none> <model,model> [task,task] [count]
```

Creates one Vite, React, and TypeScript project per task, model, and seed, and appends it to `runs/<round>/manifest.json`. A skill directory is copied to `.opencode/skills/fskill` inside each project. `none` creates projects with no skill. `count` overrides the task's `seeds`. The script prints one line per project with its ID, task, model, and seed.

### `gate.mjs`

```bash
node gate.mjs <round> [id,id]
```

Checks every build in the round, or only the listed IDs, and writes `runs/<round>/gates/<id>.json` and screenshots to `runs/<round>/shots/`.

A build fails if any of these happen:

- `npm run build` fails.
- The fskill checker fails, for builds made with the skill.
- The page is nearly empty, or a popup layer covers it, at load.
- The page scrolls sideways at a 390 px width.
- A tooltip layer covers the page.
- The first delete or remove button cannot be clicked.
- A popup layer covers the page after the delete.
- The page logs a console error.

For the todo task, the gate also adds a task and ticks a checkbox. For the mail, issues, and files tasks, it takes one screenshot after each interaction, such as opening a message or selecting two files. A missing control is noted, not failed.

### `judge-prep.mjs`

```bash
node judge-prep.mjs <round> <task> <model> <round:arm> [round:arm ...]
```

Copies the screenshots of every matching build into `$FSKILL_EVAL_DIR/review/<round>-<task>-<model>/` under shuffled letters, and writes the letter-to-build key to `runs/<round>/judging/`. Write the judge's instructions by filling `{DIR}` and `{PROMPT}` in a judge prompt file. The judge writes `scores.json` into the review folder.

### `score.mjs`

```bash
node score.mjs <round> <arm under test> <comparison arm>
```

Reads every key and `scores.json` for the round and prints, per task, the mean and range of both scores for each arm, the head-to-head pair wins, the gate pass counts, and how many builds the judges marked broken. A pair counts as a win when the arm under test has the higher sum of the two scores, and as half a win on a tie.

### `transcript.mjs`

```bash
node transcript.mjs <session ID>
```

Prints every tool call in an OpenCode builder session, in order, one per line: the tool name, then its path, command, or pattern. It reads the session through `opencode api`, so OpenCode must be installed.
