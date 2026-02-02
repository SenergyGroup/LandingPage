# QA Checklist & Test Plan

## Critical path
- [ ] Visit `/claim` and verify widget gallery loads.
- [ ] Submit email + widget; confirm redirect to `/check-email`.
- [ ] Confirm Kit email and verify redirect to `/confirmed` displays correct widget.
- [ ] Confirm `/download/:token` serves the correct ZIP only after confirmation.

## UI/UX
- [ ] Typography uses serif headings and clean sans-serif body.
- [ ] Buttons, dividers, and whitespace match minimal tech aesthetic.
- [ ] Mobile layout stacks widget preview and forms correctly.

## Abuse controls
- [ ] Rate limit blocks after 5 submissions per hour per IP.
- [ ] Attempt download without confirmation returns error.

## Data integrity
- [ ] Widget selection stored in `widget_claims`.
- [ ] Confirmed claims update `confirmed_at` and `status`.
- [ ] Download updates `delivered_at`.

## Accessibility
- [ ] Keyboard can select widget cards.
- [ ] Color contrast meets basic readability.