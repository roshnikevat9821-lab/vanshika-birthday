# Free Wish Collection (Google Sheets + Apps Script)

This adds a Google Sheet for wishes. The website does **not** need a paid service. You must deploy the Apps Script in your own Google account; I cannot deploy it or authorize access to your account for you.

## 1) Create the sheet

1. Open https://sheets.google.com and create a spreadsheet named **Vanshika Wishes**.
2. You can rename the first tab to `Wishes`, or leave it as-is; the script creates a `Wishes` tab if needed.
3. In the spreadsheet, choose **Extensions → Apps Script**.

## 2) Add the backend code

1. Open `apps-script/Code.gs` from this website package.
2. Replace the contents of the Apps Script editor with that code and save.
3. Run no function manually; the first web-app request will ask you to authorize spreadsheet access as the owner.

The backend adds a timestamp and wish to the `Wishes` tab, limits wishes to 1000 characters, rejects empty submissions, and includes a basic hidden-field honeypot. It never returns the sheet's contents to the public.

## 3) Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Choose **Web app** as the deployment type.
3. Description: `Vanshika Wish Collection`.
4. **Execute as:** Me (the spreadsheet owner).
5. **Who has access:** Anyone (or the broadest anonymous/public option your account allows). This is necessary for a guest without a Google sign-in to submit from the birthday page. The endpoint is public, so anyone who obtains the URL may submit wishes; keep the Sheet itself private and do not share its link.
6. Click **Deploy**, complete Google's authorization prompts, and copy the URL ending in `/exec`. Do not use a test `/dev` URL.

## 4) Website endpoint configuration

The current website package is already configured to use the `/exec` URL supplied by Manish. You do not need to edit `WISH_ENDPOINT` again unless you create a new Apps Script deployment. If you create a new deployment, replace the current URL in `index.html` (and in the standalone HTML export if you use it), then republish the website.

If you update the Apps Script code while keeping the same deployment, use **Deploy → Manage deployments → Edit → New version → Deploy**.

## 5) Test it

1. Open the `/exec` URL in a browser. It should display a small JSON message that the service is ready.
2. Open the birthday website, go to **Make a Wish**, type a test wish, and release it.
3. Check the `Wishes` tab in the spreadsheet. You should see a timestamp and the wish text.

## Important browser limitation

The page submits using a simple `text/plain` POST with `mode: "no-cors"`, because Apps Script's ContentService response is not readable as a normal cross-origin `fetch` response. The browser therefore cannot verify the spreadsheet's final response; the page can confirm that the request was dispatched, but **check the sheet to confirm the row was saved**. If you need definitive per-request confirmation in the UI, use a same-origin backend/proxy or a different API that supports CORS.

## Privacy and safety

- Anyone with the public endpoint URL can post a wish. Keep the actual Google Sheet private.
- Don't store sensitive personal information in the wish form.
- The website sends only the wish text and a blank honeypot field; it does not intentionally collect a name, email address, or IP address.
- Google Apps Script has usage quotas; the service is free within Google's current limits.
