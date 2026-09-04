# Northstar Commerce Client Portal - Memovix AI Test Guide

## 1. Create the project

- Project name: `Northstar Commerce Client Portal`
- Description: `Secure self-service portal for Northstar Commerce wholesale clients.`
- Status: `Active`
- Start date: `2026-08-19`
- Target completion date: `2026-12-02`

Upload these three PDFs from `output/pdf/` and wait until every file shows `INDEXED`:

1. `01_Northstar_Project_Brief.pdf`
2. `02_Northstar_Architecture_Meeting.pdf`
3. `03_Northstar_Approval_Register.pdf`

## 2. Add memories

### Memory A

- Title: `Authentication direction`
- Category: `Decision`
- Content: `Priya Nair selected Auth0 with mandatory MFA. Sarah Chen approved it on 19 August 2026 because enterprise federation was required and the team must not build a custom identity service.`

### Memory B

- Title: `Launch baseline`
- Category: `Timeline`
- Content: `Sarah Chen approved moving production launch from 18 November 2026 to 2 December 2026. The budget remains USD 85,000.`

### Memory C

- Title: `Mobile scope boundary`
- Category: `Scope`
- Content: `A native mobile application is outside the approved release. Responsive desktop and tablet support remain in scope.`

## 3. Add requirements

1. `Require client MFA` - `Every client account must use multi-factor authentication.` - Category: `Security`
2. `Show order history` - `Clients can view current and historical wholesale orders.` - Category: `Functional`
3. `Download financial documents` - `Clients can download invoices and credit notes as PDFs.` - Category: `Functional`
4. `Isolate company data` - `Clients can access only their own company data.` - Category: `Security`
5. `Meet dashboard performance` - `Dashboard loads within two seconds at p95.` - Category: `Performance`

## 4. Add decisions

1. Category `Design`: `Priya Nair decided to use Auth0 with mandatory MFA; Sarah Chen approved the decision because enterprise federation was required.`
2. Category `Design`: `Priya Nair decided to decouple integration testing from the vendor sandbox by building a mock vault adapter because repeated sandbox outages blocked automated tests.`
3. Category `Scope`: `Sarah Chen deferred the native mobile application because it would add six weeks and exceed the approved budget.`
4. Category `Timeline`: `Sarah Chen approved moving production launch from 18 November to 2 December 2026 to protect client acceptance testing.`

## 5. Add meeting note

- Title: `Architecture and launch review`
- Meeting date: `2026-08-18`
- Summary: `Priya Nair chaired a review with Sarah Chen, Marcus Lee, and Elena Ruiz. The team selected Auth0 with mandatory MFA, approved a mock vault adapter for testing, deferred the native mobile application, and moved launch to 2 December 2026.`

If testing transcript extraction, use:

> Priya: The vendor sandbox has failed again, so I propose a mock vault adapter to unblock integration tests. Sarah: Approved. Marcus: I also requested a native mobile app. Sarah: That is outside this release because it adds six weeks and exceeds the budget. Keep responsive tablet support. We will move launch from November 18 to December 2 to protect client acceptance testing. Marcus will notify pilot clients by August 21. Elena will add MFA recovery screens by August 25.

## 6. Add deliverables

1. `Portal UX prototype v3` - Status: `Approved` - Description: `Approved by Marcus Lee on 20 August 2026. Invoice download remains in primary navigation.`
2. `Authentication architecture v2` - Status: `Approved` - Description: `Approved by Sarah Chen on 19 August 2026. MFA is mandatory.`
3. `API integration specification v1` - Status: `In review` - Description: `Marcus Lee requires retry behavior and error-code mappings before approval.`
4. `Analytics dashboard concept` - Status: `Draft` - Description: `Not approved and outside the current release scope.`
5. `Revised launch plan` - Status: `Approved` - Description: `Approved by Sarah Chen on 19 August 2026 for launch on 2 December 2026.`

Use the nearest available status if the UI labels differ.

## 7. Add comments

- On `Portal UX prototype v3`: `Marcus Lee approved implementation but requested that invoice download remain in the primary navigation.`
- On `API integration specification v1`: `Marcus Lee has not approved this yet; retry behavior and error-code mappings are missing.`
- On `Authentication direction`: `Sarah Chen confirmed that email-only authentication is not acceptable.`

## 8. AI chatbot test questions and expected facts

| Capability | Question | Expected fact |
|---|---|---|
| Project memory | `Who selected Auth0, who approved it, and why?` | Priya selected it; Sarah approved; enterprise federation and avoiding a custom identity service. |
| Indexed documents | `What is the approved budget and production launch date?` | USD 85,000 and 2 December 2026. |
| Requirements | `List the security and performance requirements.` | MFA, company data isolation, 2-second p95 dashboard load; audit logging may also appear from the brief. |
| Decisions | `Why was the mock vault adapter approved?` | Vendor sandbox outages blocked automated integration tests. |
| Meeting notes | `Summarize the architecture and launch review in four bullets.` | Auth0/MFA, mock adapter, mobile deferred, launch moved. |
| Deliverables | `Which deliverables are approved, in review, or draft?` | Three approved; API specification in review; analytics concept draft. |
| Comments and approvals | `Why is the API integration specification not approved?` | Missing retry behavior and error-code mappings. |
| Comparison | `Compare the approved portal scope with the mobile request.` | Responsive desktop/tablet is in scope; native mobile is deferred/out of scope. |
| Cross-source | `Which sources confirm the revised launch date and who approved it?` | Brief, meeting record, approval register, memory, and decision; Sarah approved. |
| Negative test | `What database engine does Northstar use?` | Exact insufficient-information fallback; no invented answer. |

For positive tests, verify that the response contains inline `[Source: N]` citations, the source chips correspond to relevant records, and confidence is displayed. Confidence measures retrieval similarity, not factual certainty.

## 9. Test the other AI features

- Generate Summary: generate a project summary after all PDFs and records are indexed. It should mention the portal objective, USD 85,000 budget, 2 December launch, MFA, mobile exclusion, and pending API specification.
- Requirement Extraction: run extraction against the project brief. Confirm proposals before saving and check that duplicate requirements are not created.
- Meeting Extraction: use the transcript above. Expect the mock adapter, mobile deferral, revised launch, Marcus notification action, and Elena MFA-screen action.
- Scope Detection: compare the new request `Build native iOS and Android applications for launch`. It should be classified as new or out of scope, not already covered.

## 10. Important indexing check

Do not test immediately after uploading. Wait for each document to show `INDEXED`. If records were inserted directly into the database or results appear stale, run the backend reindex command for the project before evaluating the chatbot.
