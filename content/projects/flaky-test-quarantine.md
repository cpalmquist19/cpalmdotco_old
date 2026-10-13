---
placeholder: true
slug: flaky-test-quarantine
title: Flaky Test Quarantine
category: Test reliability
dates:
  start: 2023-09
  end: 2024-03
pitch: "An automatic quarantine for flaky tests that cut failures on healthy code from 9% of runs to 1.5%."
stats:
  - value: "1.5%"
    label: "of runs failing on flaky tests, down from 9%"
  - value: "63"
    label: "tests quarantined, then fixed or deleted"
  - value: "14"
    label: "engineers in the rollout"
stack: [TypeScript, Vitest, Playwright, GitHub Actions]
---

## Problem

Flaky tests had taught the team to rerun CI. Before the rollout, 9% of pipeline runs failed on a test that passed when it was run again, and each false failure cost someone time to check.

## What I built

A rule that moves a test into quarantine after three flaky failures in seven days. Quarantined tests still run and report, but they don't block a merge, and each one gets an owner and a deadline to be fixed or deleted.

## Numbers

- Runs failing on flaky tests fell from 9% to 1.5%.
- 63 tests were quarantined, and each was either fixed or deleted.
- The rollout covered 14 engineers.

## Stack

TypeScript, Vitest, Playwright and GitHub Actions. The quarantine list lives in the repository, so every change to it goes through review.
