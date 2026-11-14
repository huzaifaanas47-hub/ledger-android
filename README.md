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
Edit colours and the logo drawing in `scripts/make-assets.py`, run `pip install pillow && python3 scripts/make-assets.py`, commit. `assets/logo.svg` and `assets/generated/play-store-512.png` are ready for the website and Play Console.
Poppins fonts in `assets/fonts` are SIL Open Font License.
