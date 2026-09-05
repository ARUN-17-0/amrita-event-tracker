# Amrita Event Tracker: Disaster Recovery & Backup Runbook

## 1. Objectives & Targets
- **Recovery Point Objective (RPO)**: < 24 hours (maximum acceptable data loss). With Point-in-Time Recovery (PITR) enabled, RPO is < 1 minute.
- **Recovery Time Objective (RTO)**: < 2 hours to restore Firestore documents and resume application traffic.

---

## 2. Point-in-Time Recovery (PITR)
Firestore provides continuous backups with PITR (retains data for up to 7 days).

### Enable PITR via Google Cloud CLI:
```bash
gcloud firestore databases update --pitr-enabled --project=amrita-event
```

### Restore to a Point in Time:
```bash
gcloud firestore databases restore \
  --source-database='(default)' \
  --destination-database='aet-restored' \
  --recovery-time='2026-09-01T10:00:00Z' \
  --project=amrita-event
```

---

## 3. Scheduled Automated Backups
Automated nightly backups export all collections to Google Cloud Storage (GCS).

### Create Backup Bucket:
```bash
gsutil mb -p amrita-event -c STANDARD -l asia-south1 -b on gs://amrita-event-backups
```

### Manual Trigger Export:
```bash
gcloud firestore export gs://amrita-event-backups/$(date +%Y-%m-%d) --project=amrita-event
```

### Automated Daily Export via Cloud Scheduler:
Create a Cloud Scheduler job targeting the Firestore export endpoint:
- **Frequency**: Daily at 02:00 IST (`30 20 * * *` UTC)
- **Target**: HTTP POST `https://firestore.googleapis.com/v1/projects/amrita-event/databases/(default):exportDocuments`
- **Body**: `{"outputUriPrefix": "gs://amrita-event-backups"}`

---

## 4. Disaster Recovery Procedure (Step-by-Step)

### Step 1: Declare Incident & Lock Writes
If data corruption or malicious deletion occurs:
1. Update `firestore.rules` temporarily to set `allow write: if false;` to prevent further writes.
2. Deploy the lock rule: `firebase deploy --only firestore:rules`

### Step 2: Locate Most Recent Clean Backup
1. List available backups in GCS:
   ```bash
   gsutil ls gs://amrita-event-backups/
   ```
2. Identify the snapshot timestamp immediately preceding the incident.

### Step 3: Execute Restoration
Restore collections into the active database:
```bash
gcloud firestore import gs://amrita-event-backups/YYYY-MM-DD/ --project=amrita-event
```

### Step 4: Validate Data Integrity
1. Verify document counts across `profiles`, `events`, `departments`, `sections`, `subjects`.
2. Check that admin and student profiles match the known roster.

### Step 5: Unlock Database & Resume Service
1. Re-deploy production `firestore.rules`.
2. Confirm user login and event display in the live application.
