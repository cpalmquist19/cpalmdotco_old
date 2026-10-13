---
placeholder: true
slug: release-gate
title: Release Gate
category: Tooling
dates:
  start: 2023-05
  end: present
pitch: "A sign-off dashboard that cut release approval from three days to four hours."
stats:
  - value: "4 hours"
    label: "average sign-off, down from 3 days"
  - value: "18"
    label: "releases gated in 2024"
  - value: "14"
    label: "engineers using it each week"
stack: [TypeScript, Next.js, Playwright, PostgreSQL]
---

## Problem

Release approval ran on a spreadsheet, a chat thread and a meeting. Nobody could see which checks had passed, so every release waited until someone asked the right person.

## What I built

A dashboard that pulls results for each release candidate and shows one gate: the required checks, the open defects and who has signed off. Playwright end-to-end results and API checks feed in automatically, and a release can't be signed off while a required check is red.

## Numbers

- Average sign-off fell from three days to four hours.
- 18 releases went through the gate in 2024.
- 14 engineers use it each week.

## Stack

TypeScript, Next.js, Playwright and PostgreSQL, deployed from GitHub Actions.
