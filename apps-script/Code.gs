/**
 * Free Wish Collection for the Vanshika birthday website.
 * Bind this Apps Script project to the "Vanshika Wishes" Google Sheet.
 * The public endpoint accepts wishes only; it does not expose sheet contents.
 */
const WISH_SHEET_NAME = 'Wishes';
const MAX_WISH_LENGTH = 1000;

function doGet() {
  return jsonResponse_({ ok: true, service: 'Vanshika Wishes', message: 'Wish Collection endpoint is ready.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: 'Empty request.' });
    }

    const data = JSON.parse(e.postData.contents);
    // Honeypot: ignore bot submissions that fill the hidden website field.
    if (data.website && String(data.website).trim()) {
      return jsonResponse_({ ok: false, error: 'Invalid submission.' });
    }

    const wish = String(data.wish || '').trim();
    if (!wish) return jsonResponse_({ ok: false, error: 'Please provide a wish.' });
    if (wish.length > MAX_WISH_LENGTH) {
      return jsonResponse_({ ok: false, error: 'Wish is too long. Maximum 1000 characters.' });
    }

    lock.waitLock(10000);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Bind this script to your Wishes spreadsheet.');

    let sheet = spreadsheet.getSheetByName(WISH_SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(WISH_SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted at', 'Wish']);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
      sheet.setColumnWidth(1, 170);
      sheet.setColumnWidth(2, 600);
    }

    // Prevent spreadsheet formula execution if a wish starts with =, +, - or @.
    const sheetSafeWish = /^[=+\-@]/.test(wish) ? "'" + wish : wish;
    sheet.appendRow([new Date(), sheetSafeWish]);
    sheet.getRange(sheet.getLastRow(), 2).setWrap(true);
    return jsonResponse_({ ok: true, message: 'Wish saved.' });
  } catch (err) {
    console.error(err);
    return jsonResponse_({ ok: false, error: 'Unable to save the wish.' });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function jsonResponse_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
