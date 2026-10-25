# Google Sheets setup (RSVP + Wishes)

Sheet: https://docs.google.com/spreadsheets/d/1o8b_rqi40qaZLB_rTmuoEM9C8Ff-7a03VbTD0iiCsyU/edit

1. Open the sheet and go to **Extensions > Apps Script**.
2. Replace everything in `Code.gs` with the contents of `code.ts` (project root). It is plain JavaScript.
3. (Optional) Select the `setup` function and click **Run** to create the `RSVP` and `Wishes` tabs with headers now.
   Otherwise they are created automatically on the first submission. Approve the permissions prompt.
4. Click **Deploy > New deployment**, type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (ends with `/exec`).
6. Paste it into `SCRIPT_URL` in `src/guest.ts`, then rebuild / redeploy the site.

Sheets created:
- **RSVP**: Timestamp, Full Name, Guests, Dietary Notes, Attendance, Invited As
- **Wishes**: Timestamp, Guest Name, Message

If you change the script later, use **Deploy > Manage deployments > Edit > New version** so the URL stays the same.
