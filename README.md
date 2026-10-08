# PITWALL Android V1 — Nothing Phone (1)

This is the **Android project**, not an APK yet. The current execution environment does not have the Android SDK or external build access, so this project has not been compiled or tested on a physical phone.

## What the app does

- Packages PITWALL V5.4 (home, standings, calendar, histories, career game) into an Android WebView with an HTTPS local asset origin. It **starts offline**, and Internet access is used for live F1 data when available.
- 3 genuine Android Home Screen widget source implementations: next Grand Prix (Adelaide time), favorite driver's points, constructors' top 3. Uses official Jolpica-compatible API data; if fetching fails, widgets use the last downloaded snapshot. Widget updates are periodic, **not live lap timing**.
- Native Android race reminder: open the app menu (`⋮`), tap “Refresh F1 widgets”, then “Remind me before next race”. Android 13+ requests notification permission. Android may delay inexact alarms. No server push is included.
- Offline career game runs in bundled HTML/JS. Your existing iPhone/GitHub Pages career isn't automatically transferred: export its JSON save and import it from PITWALL's Settings inside Android. PITWALL career backup and calendar `.ics` downloads use Android's system file picker.

## Build a free APK using GitHub (no Mac / Android Studio)

1. Extract the project ZIP on your Windows laptop.
2. Create a **separate GitHub repository** `pitwall-android` (public is simplest for free Actions; don't add personal information or passwords).
3. Upload **all project files and folders** including `app/`, `build.gradle`, `settings.gradle`, `gradle.properties`, and **`.github/workflows/build-apk.yml`**. GitHub's web upload or GitHub Desktop can do this. If the workflow file isn't uploaded, the build won't start.
4. Commit the files on the `main` branch.
5. Open GitHub repository → **Actions** → **Build PITWALL Android APK** → **Run workflow**. It also runs on each push.
6. Open the completed workflow run and download the **PITWALL-Android-Debug-APK** artifact ZIP.
7. Extract `app-debug.apk`, transfer it to the Nothing Phone (1), and open it using the Files app. Allow installation from your file manager **only when you trust the APK you built**; follow Android's security confirmation. Do not disable general device protections.
8. Open PITWALL. Refresh F1 data while online and test the career game. To add widgets, long-press the Home Screen → Widgets → PITWALL.

**Important:** GitHub Actions' debug signing key is not guaranteed to be stable between builds. Android may refuse to install a newly built debug APK over the previous one. Back up your career before replacing builds; for long-term seamless updates, configure a **private release keystore** and securely sign each APK with the same key. Never commit signing keys or passwords.

**Limitations:** Widgets may require a manual refresh in the app after first install; race reminder is approximate and schedules only the next race, not automatic full-season push notifications. Testing the generated APK on your own Nothing Phone (1) is required. This isn't an official Formula 1 app.

## Android technical details

- Package ID: `app.pitwall.racing`, version `1.0`.
- minSdk 26 (Android 8+), targetSdk 34, compileSdk 35, Java 17, Android Gradle Plugin 8.9.2.
- Web assets loaded via androidx.webkit's WebViewAssetLoader at `https://appassets.androidplatform.net/assets/pitwall/index.html`.
- Widgets built with AppWidgetProvider and Android RemoteViews, using Jolpica REST endpoints.
- Race times localized using `Australia/Adelaide`.
- Runtime permissions: Internet and notifications (on Android 13+).
- Requires no Google Play publishing or paid Apple account.
