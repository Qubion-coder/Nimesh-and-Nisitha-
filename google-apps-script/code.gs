/**
 * Nimeshika & Nisitha – Wedding Invitation backend (Google Apps Script)
 *
 * Paste this whole file into Extensions > Apps Script (Code.gs) of the sheet:
 * https://docs.google.com/spreadsheets/d/1o8b_rqi40qaZLB_rTmuoEM9C8Ff-7a03VbTD0iiCsyU/edit
 *
 * - POST sheet=RSVP   -> appends a row to the "RSVP" sheet
 * - POST sheet=Wishes -> appends a row to the "Wishes" sheet
 * - GET  ?sheet=Wishes -> returns all wishes as JSON (newest first) for the website
 *
 * Both sheets (and their header rows) are created automatically on first use.
 * You can also run `setup` once from the editor to create them straight away.
 */

var SPREADSHEET_ID = '1o8b_rqi40qaZLB_rTmuoEM9C8Ff-7a03VbTD0iiCsyU';

var SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Full Name', 'Guests', 'Dietary Notes', 'Attendance', 'Invited As'],
    color: '#7a1f2b',
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Guest Name', 'Message'],
    color: '#1f5c45',
  },
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var params = parseParams_(e);
    var config = getSheetConfig_(params.sheet);
    if (!config) {
      return json_({ ok: false, error: 'Unknown sheet. Use "RSVP" or "Wishes".' });
    }

    var sheet = getOrCreateSheet_(config);

    if (config === SHEETS.RSVP) {
      sheet.appendRow([
        new Date(),
        clean_(params.name),
        clean_(params.guests),
        clean_(params.dietary),
        clean_(params.attendance || 'Yes'),
        clean_(params.invitedAs),
      ]);
    } else {
      if (!clean_(params.name) || !clean_(params.message)) {
        return json_({ ok: false, error: 'Name and message are required.' });
      }
      sheet.appendRow([new Date(), clean_(params.name), clean_(params.message)]);
    }

    return json_({ ok: true, row: sheet.getLastRow() });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var config = getSheetConfig_(params.sheet);

    if (config !== SHEETS.WISHES) {
      return json_({ ok: true, message: 'Wedding invitation endpoint is running.' });
    }

    var sheet = getOrCreateSheet_(config);
    var lastRow = sheet.getLastRow();
    var wishes = [];

    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, config.headers.length).getValues();
      for (var i = rows.length - 1; i >= 0; i--) {
        var row = rows[i];
        if (!row[1] || !row[2]) continue;
        wishes.push({
          timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
          name: String(row[1]),
          message: String(row[2]),
        });
      }
    }

    return json_({ ok: true, wishes: wishes });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

/** Run once from the Apps Script editor to create both sheets with headers. */
function setup() {
  getOrCreateSheet_(SHEETS.RSVP);
  getOrCreateSheet_(SHEETS.WISHES);
}

function getSheetConfig_(value) {
  var key = String(value || '').trim().toLowerCase();
  if (key === 'rsvp') return SHEETS.RSVP;
  if (key === 'wishes' || key === 'wish') return SHEETS.WISHES;
  return null;
}

function getOrCreateSheet_(config) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(config.name) || ss.insertSheet(config.name);
  ensureHeaders_(sheet, config);
  return sheet;
}

function ensureHeaders_(sheet, config) {
  var width = config.headers.length;
  var current = sheet.getRange(1, 1, 1, width).getValues()[0];
  var matches = current.every(function (cell, i) {
    return String(cell) === config.headers[i];
  });
  if (matches) return;

  // If row 1 already holds data (not headers), push it down instead of overwriting.
  var rowOneHasData = current.some(function (cell) { return cell !== ''; });
  if (rowOneHasData && config.headers.indexOf(String(current[0])) === -1) {
    sheet.insertRowBefore(1);
  }

  sheet.getRange(1, 1, 1, width)
    .setValues([config.headers])
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground(config.color)
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.autoResizeColumns(1, width);
}

function parseParams_(e) {
  var params = (e && e.parameter) || {};
  if (Object.keys(params).length > 0) return params;

  var contents = e && e.postData && e.postData.contents;
  if (!contents) return {};

  try {
    return JSON.parse(contents);
  } catch (_err) {
    var out = {};
    String(contents).split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var key = decodeURIComponent((idx === -1 ? pair : pair.slice(0, idx)).replace(/\+/g, ' '));
      var val = idx === -1 ? '' : decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      out[key] = val;
    });
    return out;
  }
}

// Strip leading characters that would make Sheets treat input as a formula.
function clean_(value) {
  var text = String(value == null ? '' : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
