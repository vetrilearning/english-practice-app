# English Practice — mobile app project

This project has two parts:

- **frontend/** — the chat app itself (HTML/CSS/JS). This is what becomes
  your mobile app.
- **backend/** — a tiny server that holds your Anthropic API key and
  safely forwards chat requests. Required because an API key can never
  be placed inside the app itself (anyone could extract and misuse it).

Follow the steps in order. You don't need to know how to code to follow
these — just copy/paste the commands.

---

## 1. Put this project on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Create a new **empty** repository (e.g. `english-practice-app`).
3. On your computer, in this project folder, run:

   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/english-practice-app.git
   git push -u origin main
   ```

---

## 2. Get an Anthropic API key

1. Go to https://console.anthropic.com and sign up.
2. Create an API key. Copy it somewhere safe — you'll need it in step 3.
   (This is a paid API — check current pricing on the Anthropic site.
   It's separate from your Claude.ai subscription.)

---

## 3. Deploy the backend (holds your API key)

Any Node.js host works. **Render** has a simple free tier, so these
steps use it as an example:

1. Go to https://render.com and sign up, connect your GitHub account.
2. Click **New → Web Service**, select your `english-practice-app` repo.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = *(the key from step 2)*
   - `ALLOWED_ORIGINS` = `*` (tighten this later once you know your app's URL)
5. Deploy. Render will give you a URL like
   `https://english-practice-backend.onrender.com`.
6. Test it: open that URL in a browser — you should see
   `{"status":"ok", ...}`.

*(Railway, Fly.io, or your own VPS work the same way — the key step is
always: set `ANTHROPIC_API_KEY` as an environment variable, never in code.)*

---

## 4. Point the frontend at your backend

1. Open `frontend/index.html`.
2. Find this line near the top of the `<script>` section:

   ```js
   const API_URL = "https://YOUR-BACKEND-URL.example.com/api/chat";
   ```

3. Replace it with your real backend URL from step 3, plus `/api/chat`:

   ```js
   const API_URL = "https://english-practice-backend.onrender.com/api/chat";
   ```

4. Commit and push this change to GitHub.

---

## 5. Host the frontend and try it as an installable app (PWA)

1. In your GitHub repo, go to **Settings → Pages**.
2. Set **Source** to your `main` branch, folder `/frontend`.
3. Save — GitHub will give you a URL like
   `https://YOUR-USERNAME.github.io/english-practice-app/`.
4. Open that link on your phone.
   - **Android (Chrome)**: menu → "Add to Home screen" / "Install app".
   - **iPhone (Safari)**: Share button → "Add to Home Screen".
5. It now opens full-screen from your home screen like a real app,
   and works partly offline (the chat itself still needs internet).

This is often enough — no app store needed, free hosting, works on both
Android and iPhone.

---

## 6. (Optional) Build a real Android/iOS app with Capacitor

If you specifically want a Play Store / App Store app, wrap the same
frontend with [Capacitor](https://capacitorjs.com):

```
npm install -g @capacitor/cli
cd frontend
npm init -y
npm install @capacitor/core @capacitor/android @capacitor/ios
npx cap init "English Practice" "com.yourname.englishpractice" --web-dir .
npx cap add android
npx cap add ios      # macOS + Xcode only
npx cap sync
```

- **Android**: `npx cap open android` opens the project in Android
  Studio, where you can run it on a device/emulator or build a
  signed `.apk`/`.aab` to upload to the Play Store (requires a
  one-time $25 Google Play developer account).
- **iOS**: `npx cap open ios` opens it in Xcode (requires a Mac and an
  Apple Developer account, $99/year, to publish to the App Store).

You do not need to redo steps 1–5 for this — Capacitor just wraps the
same `frontend/` folder you already built.

---

## Notes on cost and safety

- Every message sent in the app calls the Anthropic API and costs a
  small amount based on usage — check current pricing at
  https://www.anthropic.com/pricing.
- Never put your `ANTHROPIC_API_KEY` inside `frontend/` files or commit
  it to GitHub — it must only live in the backend's environment
  variables (`.env` is already git-ignored for this reason).
- Once you know your GitHub Pages URL, set `ALLOWED_ORIGINS` on the
  backend to that exact URL instead of `*`, so only your app can use
  your key.
