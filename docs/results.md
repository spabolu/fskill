# How fskill was tested

This page explains how fskill was tested, what the tests found, and where they fall short. The [test scripts](../eval/README.md) and the [decision log](../decisions.tsv) hold the details.

## The question

Does an agent with fskill build an app that passes for a Microsoft 365 web app, without adding features nobody asked for? And does it do better than the same agent without fskill?

## Method

Two agents built the same apps from the same prompts, once with fskill and once without. The agents were Grok 4.7 at its highest reasoning setting and the smaller Gemini 3.8 Flash. Each prompt read like a normal user request and ended with "Make it look and feel like a professional Microsoft web app." No prompt mentioned testing.

Every build then went through a gate in Chrome. The gate built the app, ran the fskill checker on builds made with the skill, and loaded the page at desktop and phone widths. It failed builds that scrolled sideways on a phone, showed a blank or covered page, logged a console error, or could not delete an item. It also saved screenshots at load, on a phone, and after a delete. For the complex apps, it saved more after interactions such as opening a message or selecting two files.

A judge model saw the screenshots under shuffled letters, never the agent or the arm. It scored each build from 1 to 10 on two things:

- **Looks like M365.** Does it pass as a real Microsoft 365 app built with Fluent 2?
- **Restraint.** Does every element earn its place? This score drops for decoration, unrequested features, repeated information, and layout flaws.

The judge also marked a build broken when part of it failed to show or work. A head-to-head pair is a win for the build with the higher sum of the two scores. From round 6 on, two judges scored each comparison, and the tables average them.

## Simple apps

Four apps: a todo list, a settings page, a team admin page, and an expense tracker. The expense tracker joined later as a check, though notes from judging it shaped one rule, the layout of summary cards.

| App | With fskill: looks like M365 | With fskill: restraint | Without: looks like M365 | Without: restraint | fskill wins | Judged broken, with / without |
| --- | --- | --- | --- | --- | --- | --- |
| Todo list | 7.7 | 7.8 | 5.1 | 3.4 | 36 of 36 pairs | 0 of 12 / 6 of 12 |
| Settings page | 7.0 | 6.9 | 4.3 | 2.9 | 16 of 16 pairs | 0 of 8 / 6 of 8 |
| Team admin | 7.5 | 6.9 | 4.4 | 2.6 | 16 of 16 pairs | 0 of 8 / 8 of 8 |
| Expense tracker | 7.8 | 7.8 | 5.8 | 3.8 | 16 of 16 pairs | 0 of 8 / 4 of 8 |

The todo, settings, and expense rows come from round 7. The team row comes from round 8, which added the badge fix. All 18 fskill builds in those rows passed the gate. Without fskill, 9 of 18 did. The rest scrolled sideways on phones, covered the page with a popup layer, could not delete an item, or could not add a task.

### A check against the judge and the baselines

The baselines in that table were built in round 1, and one judge model, Claude Opus 5.5, scored every round. To test whether either choice inflated the result, the same agents built six fresh todo apps without fskill, and both Claude Opus and Grok 4.7 scored them against fskill.

| Judge | fskill: looks like M365 | fskill: restraint | Without: looks like M365 | Without: restraint | fskill wins |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 7.8 | 8.2 | 5.3 | 4.0 | 18 of 18 |
| Grok 4.7 | 7.5 | 7.7 | 5.7 | 4.2 | 17 of 18 |

No fskill build was marked broken. Seven of the twelve judgments of the fresh builds without fskill were.

## Complex apps

Three larger apps tested patterns the simple apps never touched. The mail client needs a reading pane. The issue tracker needs a board, a list, and a side panel. The file manager needs a breadcrumb, list and grid views, and actions on several selected items. The gate saved a screenshot after each interaction, and both Claude Opus and Grok judged every set.

The first version tested on these apps lost to builds without fskill on mail and files. Its builds broke far less often, but they looked less like Microsoft 365. The judges named the reasons: panes floated as separate cards, the breadcrumb repeated the title, item names were underlined blue links, and the board and list switch appeared twice. Agents had also edited the starter files to get a full-width layout and row selection. Two rounds of fixes followed, and the second round scored as below. The same judges scored the first version alongside it.

| App | Latest judged: looks like M365 | Latest judged: restraint | Without: looks like M365 | Without: restraint | Wins against no skill | Wins against the first version | Judged broken, latest judged / without |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mail client | 6.8 | 7.3 | 6.6 | 4.9 | 6.5 of 8 pairs | 8 of 8 pairs | 0 of 4 / 8 of 8 |
| Issue tracker | 7.0 | 6.8 | 5.5 | 4.6 | 7 of 8 pairs | 6 of 8 pairs | 2 of 4 / 7 of 8 |
| File manager | 5.8 | 6.3 | 6.4 | 5.4 | 4.5 of 8 pairs | 7 of 8 pairs | 0 of 4 / 8 of 8 |

In the same judgments, the first version won 6 of 16 pairs on mail and 4.5 of 16 on files.

The file manager is still even. Judges rate the builds without fskill that copy OneDrive closely, with a folder tree and colored file icons, as looking more like Microsoft 365, even though every one of them broke on a phone. The two broken issue-tracker judgments both describe board columns cut off at a 1280 px width. The released version fixes that and the judges' other notes from this round, but no judged round has tested those last fixes.

## What the tests changed in fskill

Each round's judge notes became a change, and each change was tested in the next round. These changes made the most difference:

- The left menu holds an app's views, such as All tasks, Active, and Completed, the way Microsoft To Do does. That moved the todo score more than any other change.
- The header has an app launcher. In a controlled test on one todo app, it raised the M365 score from 7 to 8 with both judges.
- The checker fails a `Badge` with `color="subtle"`. That color is white, and it made the role badges on one team page disappear.
- `AppShell` has a full-width mode for mail and file apps, and `DataTable` has row selection. Agents had been editing the templates to add both.

The [decision log](../decisions.tsv) lists every change, its reason, and its evidence, including the changes that did not help and were dropped.

## Limits

- fskill was tuned on the same prompts it was scored on. Treat the results as evidence about similar apps, not about every app.
- The judge is a model, not a person. Scores for the same screenshots moved by about half a point between runs, so differences under a point between fskill versions are noise.
- The pair rule adds the two scores and ignores the broken flag. A build that looks right but breaks on a phone can still win a pair.
- Each round used one to three builds per app and agent. Small samples swing.
