---
placeholder: true
slug: ticket-triage-assistant
title: Ticket Triage Assistant
category: Applied AI
dates:
  start: 2025-02
  end: 2025-11
pitch: "A model that suggests a queue and priority for each support ticket, checked against 400 labelled examples."
stats:
  - value: "72%"
    label: "correct queue on the first suggestion"
  - value: "400"
    label: "labelled tickets in the eval set"
  - value: "6 hours"
    label: "of manual triage saved each week in the pilot"
stack: [Python, Claude API, pytest]
repo: https://example.com/placeholder-ticket-triage
---

## Problem

Incoming tickets often sat in the wrong queue for hours, and someone had to sort them by hand each morning. The sorting rules were out of date and nobody wanted to maintain them.

## What I built

A Python service that reads a ticket's text and returns a queue, a priority and a one-line reason, using the Claude API. Before the first prompt change, I built an eval set of 400 labelled tickets and a pytest run that scores every change against it. The pilot ran on one queue for six weeks.

## Numbers

- 72% of tickets went to the correct queue on the first suggestion.
- The eval set holds 400 labelled tickets.
- The pilot saved about six hours of manual triage each week.

## Stack

Python, the Claude API and pytest. The eval set is kept in the repository next to the prompt, so a change to either is reviewed together.
