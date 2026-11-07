# Saathi — autism monitoring & intervention app

A React web app for the IIT Kanpur autism project. **Firebase is the only backend**: Firebase Auth for
logins, Cloud Firestore for data, and Firestore Security Rules ([firestore.rules](firestore.rules)) for
server-side access control. It runs on the free Spark plan.

## Modes

**Individual** (parent, family member, caregiver, teacher)

| Area | What it does |
|---|---|
| Child profiles | Create one or more children. Each gets a non-secret **Child ID** (e.g. `S7K2PX`, shown to researchers) and a private **join code**. Other people (other parent, sibling, relative, caregiver, teacher) join with the code and pick their relation. The owner can remove people or issue a new code; contributors can leave. |
| Daily tracking | **Sleep** (times, quality, difficulty falling asleep, night waking), **Mood** (overall mood, outburst, observations), **Appetite** (overall, pattern change, food refusal), each with free text. **Incidents** record what happened, before and after, the child's response, what helped, and severity. |
| Questionnaires | **Domain screening questionnaire** (main; Low / Medium / High per domain), **ATEC** (77 items, 4 subscales), **M-CHAT-R** (≤ 2.5 years). Each is taken as pre- or post-intervention. |
| Interventions | Domains scored Medium or High produce **recommendations** (why, what, how, steps, what to record) that you **Accept** or **Reject**. You can also browse the strategy library or **add your own** intervention. Active interventions have their own recording form, a history and a weekly progress chart. The default period is 6 weeks; when it ends, the app prompts the follow-up questionnaire. |
| Visual routines | Picture slideshows for routines and upcoming changes, with read-aloud. |
| Progress | Domain scores over time, scores by contributor, home vs centre mood, sleep, appetite and sleep quality, incidents per week, intervention sessions per week, ATEC trend, M-CHAT history. Can be filtered by contributor. |
| Settings | Notifications, joining or withdrawing from a research study, guideline links, consent, **download my data (JSON)**, **delete my account**. |

**Researcher**

| Area | What it does |
|---|---|
| Studies | Create a study with a title, description, duration (4–12 weeks), assessment schedule (which questionnaires), interventions every participant starts with, and **study-specific consent**. Each study gets an **invitation code**. Enrolment can be closed or reopened. |
| Joining | A participant enters the code in Settings, reads the study consent, picks the child, and joins. The researcher then gets read access to that child. |
| Study dashboard | Participants by Child ID: week, tracking adherence, intervention sessions, tasks, incidents, last activity. Also a study-level pre vs post comparison and withdrawal requests. |
| Participant view | Progress charts, **contributions by contributor** (e.g. `S7K2PX → Parent`), questionnaires, interventions (assign from the library or write a custom one), **tasks** (written answer or mark-as-done), and private **progress notes**. |
| Follow-up | Baseline and follow-up questionnaires are prompted to the family automatically, based on the study's schedule and dates. |
| Withdrawal | A participant requests it and chooses whether research data is deleted. The researcher approves; the research-only data (tasks, researcher-assigned interventions, notes) is deleted if requested, and the researcher's access is removed. |

## Setup

1. Firebase console → create a project → **Authentication**: enable Email/Password → **Firestore**: create a database (e.g. `asia-south1`).
2. Add a Web app and put its config in `.env` (see `.env.example`).
3. Publish [firestore.rules](firestore.rules) (Firestore → Rules → paste → Publish), or run:
   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```
4. Install and run:
   ```bash
   npm install
   npm run dev   # http://localhost:5180
   ```

If you created test data with the first prototype, delete the old `children`, `codes` and `users` documents in the Firestore console; the data model has changed.

## Data model (Firestore)

```
users/{uid}                         name, email, mode: individual|researcher, lang, consent
codes/{JOINCODE}                    childId, ownerUid                       (get by exact code only)
children/{childId}                  publicId, demographics, code, ownerUid, memberUids[], members{uid:{name, relation}},
                                    studyId, researcherUid
  entries/{type_date_uid}           sleep|mood|appetite, answers{}, author + relation
  incidents/{id}                    what/before/after/response/helped/severity, author + relation
  assessments/{id}                  checklist|atec|mchat, pre|post, scores, studyId
  interventions/{id}                templateId | custom{}, status, source, start/end, studyId
    logs/{id}                       values{}, notes, author + relation
  tasks/{id}                        researcher-set; family completes
  routines/{id}                     visual routine slides
studies/{sid}                       ownerUid, title, duration, instruments[], consentText, code, active
  participants/{childId}            publicId, dates, status, deleteDataRequested
    notes/{id}                      researcher-only progress notes
studyCodes/{CODE}                   studyId, ownerUid
```

## Where to edit content

- `src/content/domains.ts`: questionnaire domains, items, cut-offs (`bandFor`). These are **draft** until the team's 4–5 AEPS-3-inspired domains are ready.
- `src/content/interventions.ts`: intervention library and recording forms. **Placeholder**, to be replaced by the AEPS-3-inspired set.
- `src/content/instruments.ts`: M-CHAT-R and ATEC items and scoring.
- `src/content/diaries.ts`: daily tracking questions.
- `src/content/consent.ts`, `src/content/studyConsent.ts`: general and default study consent (basic v1 text; bump `CONSENT_VERSION` when the wording changes so users re-consent).
- `src/i18n/strings.ts` and inline `T('English', 'हिंदी')` calls: UI text.

## Known limits

- **Licences pending:** M-CHAT-R (electronic use) and ATEC, both requested from their authors by email. Hindi item text is a working translation.
- **Reminders** work in-app and as browser notifications while a tab is open. Push notifications with the app closed would need Cloud Functions (Blaze plan).
- **One study per child at a time.**
- **No audio recording** (decided by the team).
- The researcher sees the child's Child ID in the app, but the child's name is still in the Firestore document they can read.
