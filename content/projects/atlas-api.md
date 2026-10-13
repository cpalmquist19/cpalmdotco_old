---
placeholder: true
slug: atlas-api
title: Project Atlas
category: Test automation
dates:
  start: 2021-03
  end: 2022-11
pitch: "An API test suite that cut the regression run from 47 minutes to 9."
stats:
  - value: "1,240"
    label: "automated API tests"
  - value: "9 min"
    label: "suite runtime, down from 47"
  - value: "3"
    label: "teams onboarded"
stack: [Python, pytest, Docker, GitHub Actions]
repo: https://example.com/placeholder-atlas-api
---

## Problem

Regression testing for the storefront API ran as a manual checklist and a UI-heavy Selenium suite. The run took 47 minutes and barely touched the API, so breaking changes often reached staging before anyone noticed.

## What I built

A pytest suite that calls each endpoint directly, with shared fixtures for authentication and test data. Tests run in parallel containers in GitHub Actions, and each failure links to the request and response that caused it. I wrote the guide the onboarded teams use to add their own tests, and ran a session with each team.

## Numbers

- 1,240 automated API tests across three services.
- The regression run fell from 47 minutes to 9.
- Three teams onboarded between 2021 and 2022.

## Stack

Python, pytest, Docker and GitHub Actions, with a shared fixtures package that every team imports.
