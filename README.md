# Ledger Android app

A native Android shell (Capacitor) that opens your live Ledger website, so **every change you upload to your server appears in the app instantly**, with the offline queue, camera/receipt upload, icon, splash screen and update screens built in.

## 1. Server (once)
1. Upload `app.php`, `offline.php`, `index.php`, `wa_webhook.php` to your site.
2. Open `https://YOUR-DOMAIN/app.php?a=admin`, type a password (10+ chars), copy the generated `define('APP_ADMIN_HASH', ...)` line into `config.php`, reload and sign in.
3. For big APKs raise `upload_max_filesize` and `post_max_size` (e.g. 100M) in PHP, and `client_max_body_size 100m;` in nginx.

## 2. Build the APK (no Android Studio needed)
1. Create a **private** GitHub repository and upload everything in this folder (keep the `.github` folder).
2. Repo > Actions > **Build Android APK** > Run workflow. Enter your site address (https://...), version name (1.0.0) and version code (1).
3. After ~5 minutes download the `Ledger-APK` artifact, unzip, send the `.apk` to the phone and install it (allow "Install unknown apps").

### Signing key (do this before your first real release)
Updates only install over an existing app if every APK is signed with the **same key**. Create it once and keep the file safe:
```
keytool -genkeypair -keystore ledger.jks -alias ledger -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 ledger.jks   # paste the output into the secret below
```
Repo > Settings > Secrets and variables > Actions: add `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD` (use the same password for store and key) and `KEY_ALIAS` (ledger). Without these secrets the workflow signs with a temporary key (fine for testing only).

## 3. Releasing updates
* **Website / PHP / design changes:** just upload the files. Phones get them on next open. In the admin panel use **Push web refresh** to force every phone to drop its cached pages.
* **New APK (native change, icon, version):** raise the version code, run the workflow, then in `app.php?a=admin` > Publish release, attach the new APK. Phones see an "Update available" screen (or a blocking one if you tick *Force*).
* **Maintenance / announcements:** also in the admin panel.

## 4. Branding
The logo (open ledger book + rising gold arrow on an emerald tile) lives in `scripts/logo/mark.js`. To change it, edit that file and run
`npm i --no-save playwright && npx playwright install chromium && node scripts/logo/make-assets.js`
(it rewrites the launcher icons, adaptive/monochrome icons, splash screens and the website icons in `assets/web/`). Commit the result.
`assets/logo.svg` and `assets/generated/play-store-512.png` are ready for the website and Play Console.
Poppins fonts in `assets/fonts` are SIL Open Font License.


## 5. Version 1.1.0 changes
* **Stays signed in**: the app flushes WebView cookies to disk every time it goes to the background (`MainActivity`), and the server issues a long-lived sign-in token, so users log in once and only sign in again after pressing Log out.
* **Data on the phone**: the website keeps a signed full copy of the user's data inside the app and sends back anything the server lost (see the main project README, "DATA ON THE PHONE"). Android Auto Backup is on (`allowBackup`), so Google can also restore the app's data when the phone is changed.
* **New logo, splash screen and green theme.**
* Build it exactly as before; use version name **1.1.0**, version code **2** (the defaults in the workflow), sign with the **same keystore** as 1.0.0 so it installs as an update.
