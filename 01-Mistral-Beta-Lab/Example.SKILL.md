---
name: "code-review-checklist"
description: "Automated code review for common issues"
user_invocable: true
allowed_tools: ["file", "search"]
license: "MIT"
compatibility: ["vibe>=1.0.0"]
---

## Instructions
## Run through the checklist for the specified path...

## Field	Required	Purpose
## name	Yes	Identifier — no spaces
## description	Yes	Human-readable purpose
## user_invocable	Yes	Enables /skill-name slash command
## allowed_tools	Yes	Tools the skill may call
## license	Yes	Legal license identifier
## compatibility	Yes	Minimum Vibe version
## A SKILL.md file combines YAML frontmatter for machine-discoverable metadata with Markdown body text that provides instructions for the agent.

## The description field is what agents use when deciding whether to invoke a skill — write it clearly.