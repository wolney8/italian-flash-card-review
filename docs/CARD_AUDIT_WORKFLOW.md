# Card audit workflow

The public review site remains uncluttered for the tutor and class. Personal audit controls are enabled only by adding `?audit=1` to the site URL:

`https://italian-flash-card-review.netlify.app/?audit=1`

Open a lesson from that page, then review each card using one of three statuses:

- **Reviewed OK** — useful and accurate as shown.
- **Needs change** — opens the existing comment box for a concise correction.
- **Remove** — opens the comment box to explain why the card adds no useful learning.

All three choices count as **audited**. **Next unreviewed** skips every card that already has one of those three decisions.

## Suggested comment prefixes

```text
FIX FRONT —
FIX ANSWER —
FIX BOTH —
UNCLEAR TARGET —
MISSING BREAKDOWN —
DUPLICATE —
SOURCE CHECK —
REMOVE —
```

## Storage and spreadsheet rows

- The current status is saved in the reviewer’s browser using the permanent card key.
- Every action is also appended to the private Google Sheet.
- Audit scopes are:
  - `audit_ok`
  - `audit_fix`
  - `audit_remove`
  - `audit_reset`
- If a card receives more than one audit action, the latest timestamp is the current decision.
- Existing tutor comments and earlier review rows are not modified.

## Progress and navigation controls

Audit mode shows:

- lesson progress;
- counts for OK, needs change, remove and unreviewed;
- filters for each status;
- a lesson-level **Next unreviewed** button;
- a **Next unreviewed** button on every card;
- an audited-card **Collapse card / Expand card** control;
- a count on every subdeck, such as `6/10 audited · 4 OK · 1 change · 1 remove`.

Card collapse state and audit progress are browser-local. The Google Sheet is the durable review record.

## Release process

1. Apply any confirmed tutor corrections to the website.
2. Audit one subdeck at a time.
3. When a lesson is complete, review the latest audit row for every card.
4. Produce one consolidated deck update after the audit rather than repeated small packages.
5. Preserve existing note/card identities and website card keys for all retained cards.
