# Other agents and manual setup

The skill uses the portable [Agent Skills format](https://agentskills.io/specification): a folder named `rentner-rules`, a `SKILL.md` with `name` and `description`, and relative supporting references. It does not require a Codex runtime, a particular model, or orchestration tooling.

For any agent registered in Skills CLI 1.7.0, use its identifier from the [supported agent list](https://github.com/vercel-labs/skills/blob/v1.7.0/README.md#supported-agents). This includes additional targets such as Cline, Roo Code, Continue, and Antigravity. The all-agent command in [agents/README.md](README.md) delegates target selection to the CLI.

For manual installation, copy the complete repository contents into the agent's supported `skills/rentner-rules/` location. Preserve `SKILL.md`, `references/`, and their relative paths. Check the agent's official documentation for discovery and invocation.

For a tool that can read Markdown instructions but has no native Agent Skills support, reference the installed `SKILL.md` from its existing project instruction file and instruct it to read the matching language profile. Merge that reference into existing instructions without overwriting them. This is a manual integration, not automatic skill discovery.

All integrations use the established TypeScript and Rust-only profiles and leave the combined profile for later planning. A supported installation target alone does not prove successful discovery or execution in that agent.
