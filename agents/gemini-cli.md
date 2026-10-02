# Gemini CLI

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a gemini-cli
bunx skills@1.7.0 list -g -a gemini-cli
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The default global destination is `~/.gemini/skills/rentner-rules/`. Gemini also discovers workspace skills in `.gemini/skills/`.

Use `/skills list` inside Gemini CLI to confirm discovery; `/skills reload` refreshes the skill list. Ask Gemini to use `rentner-rules` for the task, or let it select the skill when relevant. Its language selection comes from the shared `SKILL.md`.

See the [shared integration notes](README.md) and [official Gemini CLI skills documentation](https://geminicli.com/docs/cli/skills/).
