# GitHub Copilot

Install globally:

```powershell
bunx skills@1.7.0 add RentnerKev/Rentner-Rules-Skill --skill rentner-rules -g -a github-copilot
bunx skills@1.7.0 list -g -a github-copilot
```

Omit `-g` for a project install at `.agents/skills/rentner-rules/`. The default global destination is `~/.copilot/skills/rentner-rules/`. Copilot also supports project skills in `.github/skills/` and `.claude/skills/`.

Use an agent surface with Agent Skills support and ask Copilot to use `rentner-rules`. Keep a project installation in the repository when the agent runs remotely and cannot read your local global installation. The shared `SKILL.md` supplies language routing and conventions.

See the [shared integration notes](README.md) and [official GitHub Copilot skills documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).
