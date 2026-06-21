# Pijaca Plus

A Serbian farmers'-market app that digitizes local *pijace* (markets) and connects small
producers with buyers. Two personas, each with its own flow:

- **Kupac (buyer)** — browse products & markets, reserve, save/generate recipes, scan receipts
  (OCR), food-saved heatmap, purchase history.
- **Prodavac (seller)** — post ads (text or voice), manage listings, dynamic discounts, AI surplus
  prediction, donations (chatbot + tax report), sales statistics.

All UI copy is in **Serbian (latin)**. The app talks to a small **REST API** that owns all data.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Repository layout](#repository-layout)
3. [Prerequisites](#prerequisites)
4. [Android SDK & `ANDROID_HOME` setup](#android-sdk--android_home-setup)
   - [macOS](#macos) · [Linux](#linux) · [Windows](#windows) · [WSL2](#wsl2-windows-subsystem-for-linux)
5. [Run the backend (API)](#1-run-the-backend-api)
6. [Configure the app (`.env`)](#2-configure-the-app-env)
7. [Run the app](#3-run-the-app)
   - [A. Dev build on emulator/device](#a-dev-build-on-an-emulator-or-device-recommended) ·
     [B. Expo Go](#b-expo-go-lightweight--also-the-wsl-path) ·
     [C. Web](#c-web-browser-quick-preview)
8. [Demo accounts](#demo-accounts)
9. [What is real vs mocked](#what-is-real-vs-mocked)
10. [Scripts reference](#scripts-reference)
11. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Layer | Tech |
|------|------|
| Mobile app | Expo SDK **56**, React Native 0.85, React 19, expo-router (file-based), TypeScript (strict) |
| Native modules | expo-camera, expo-image-picker, expo-audio, expo-secure-store, expo-image, @expo/vector-icons |
| Backend | Node + Express + TypeScript, Prisma ORM, SQLite, JWT auth, multer uploads, zod validation |

The app is in the repo subfolder **`PiazzaPlus/`**; the API server is in **`PiazzaPlus/server/`**.

## Repository layout

```
PiazzaPlus/                  # Expo app (run all app commands from here)
├── app.json                 # Expo config (permissions, plugins)
├── .env.example             # copy to .env and set the API URL
├── src/
│   ├── app/                 # expo-router screens: (auth) / (kupac) / (prodavac)
│   ├── api/                 # typed API client + SDK + models
│   ├── components/          # design-system component library
│   ├── store/               # auth context, ad-draft context
│   ├── theme/               # design tokens + fonts
│   └── lib/                 # image map, helpers
├── assets/images/pijaca/    # product/recipe/map imagery
└── server/                  # REST API
    ├── prisma/
    │   ├── schema.prisma     # data model
    │   └── seed.ts           # data initializer
    └── src/
        ├── index.ts          # Express app
        ├── routes/           # auth, catalog, reservations, listings, recipes, …
        └── middleware/       # JWT auth
```

## Prerequisites

- **Node.js 20+** and npm
- **JDK 17+** (required to build the Android app)
- **Android Studio** with: an **SDK Platform** (API 34/35/36), **Android SDK Platform-Tools**
  (`adb`), the **Android Emulator**, and at least one **AVD** (virtual device) — or a physical
  Android phone with USB debugging enabled.

---

## Android SDK & `ANDROID_HOME` setup

Expo needs `ANDROID_HOME` (a.k.a. `ANDROID_SDK_ROOT`) to point at your Android SDK, and `adb` +
`emulator` on your `PATH`. Install the SDK via **Android Studio → Settings → Languages & Frameworks
→ Android SDK** (note the *Android SDK Location* shown there), then set the variables for your OS.

Verify any setup with:

```bash
echo "$ANDROID_HOME"      # should print the SDK path
adb --version             # should print a version
emulator -list-avds       # should list your virtual device(s)
```

### macOS

Add to `~/.zshrc`:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin"
```

### Linux

Add to `~/.bashrc`:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin"
```

### Windows

Default SDK path is `%LOCALAPPDATA%\Android\Sdk` (e.g. `C:\Users\<you>\AppData\Local\Android\Sdk`).
Set environment variables (System → *Edit the system environment variables*), or PowerShell:

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator"
```

Reopen the terminal afterwards.

### WSL2 (Windows Subsystem for Linux)

You typically have Android Studio + the SDK **on Windows**, but want to run Metro/Node **in WSL**.
The trick is to let the Expo CLI (which calls a Linux `adb`/`emulator`) drive the Windows tools, and
to bridge ports with `adb reverse`. Do this once:

```bash
# 1) Point at the Windows SDK (adjust <you>)
WSDK="/mnt/c/Users/<you>/AppData/Local/Android/Sdk"

# 2) Create a tiny "shim" SDK whose adb/emulator exec the Windows .exe files
SHIM="$HOME/android-sdk-shim"
mkdir -p "$SHIM/platform-tools" "$SHIM/emulator"
printf '#!/usr/bin/env bash\nexec "%s/platform-tools/adb.exe" "$@"\n'      "$WSDK" > "$SHIM/platform-tools/adb"
printf '#!/usr/bin/env bash\nexec "%s/emulator/emulator.exe" "$@"\n'        "$WSDK" > "$SHIM/emulator/emulator"
chmod +x "$SHIM/platform-tools/adb" "$SHIM/emulator/emulator"

# 3) Export the env (append to ~/.bashrc to make it permanent)
export ANDROID_HOME="$SHIM"
export ANDROID_SDK_ROOT="$SHIM"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

> Why a shim? With `ANDROID_HOME` pointing straight at the Windows SDK, Expo tries to spawn
> `platform-tools/adb` (no `.exe`) and fails. The shim provides Linux-named wrappers that call the
> real Windows binaries, so `adb`/`emulator` work from WSL.

Then: boot a device and bridge the ports (see [Option B](#b-expo-go-lightweight--also-the-wsl-path)).
A native Linux Android SDK + in-WSL emulator is also possible but needs KVM/nested virtualization;
the shim approach above is simpler and is the tested path for this project.

---

## 1. Run the backend (API)

```bash
cd PiazzaPlus/server
npm install
npm run setup     # prisma generate + db push + seed the database (first time only)
npm run dev       # starts the API on http://localhost:4000 (auto-reloads)
```

`npm run setup` creates `prisma/pijaca.db` and seeds the catalog, two accounts, the seller's
listings, and a coherent set of orders. To reseed from scratch later: `npm run seed`.

The server binds IPv4 `0.0.0.0:4000`. Health check: `curl http://localhost:4000/api/health`.

## 2. Configure the app (`.env`)

From `PiazzaPlus/`, copy the example and set the URL the **device** uses to reach the API:

```bash
cp .env.example .env
```

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|--------------------|------------------------|
| Android emulator (native, no tunnel) | `http://10.0.2.2:4000` |
| Emulator/device with `adb reverse tcp:4000` | `http://localhost:4000` |
| Physical phone over Wi-Fi | `http://<your-computer-LAN-IP>:4000` |
| **WSL2 + Windows emulator** | `http://localhost:4000` (use `adb reverse`, below) |
| Web browser | `http://localhost:4000` |

`.env` is git-ignored; `.env.example` is the committed template.

## 3. Run the app

Install app dependencies once: from `PiazzaPlus/` run `npm install`.

### A. Dev build on an emulator or device (recommended)

Full native features (camera, mic, gallery). Requires the Android setup above.

```bash
# start an emulator (or plug in a phone with USB debugging)
emulator -avd $(emulator -list-avds | head -1) &

cd PiazzaPlus
npx expo run:android        # builds & installs the dev client, then launches it
# later launches:
npx expo start --dev-client
```

Use `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` for a native emulator.

### B. Expo Go (lightweight — also the WSL path)

This app uses only first-party Expo modules, so it runs in **Expo Go** without a native build.
This is the recommended path on **WSL2** (driving the Windows emulator).

```bash
# 1) Boot an AVD
emulator -avd $(emulator -list-avds | head -1) &
adb wait-for-device

# 2) Install Expo Go once (SDK 56). Get the APK from:
#    https://github.com/expo/expo-go-releases/releases  (Expo-Go-56.x.y.apk)
adb install /path/to/Expo-Go-56.0.1.apk

# 3) Bridge Metro (8081) and the API (4000) to the device, then start Metro
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
cd PiazzaPlus
npx expo start --localhost
```

Open the app on the device: press **a** in the Expo terminal, or:

```bash
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

With `adb reverse tcp:4000`, set `EXPO_PUBLIC_API_URL=http://localhost:4000`.

### C. Web browser (quick preview)

Fastest way to click through screens. Camera/mic/gallery are limited in a browser; everything else
works against the API.

```bash
cd PiazzaPlus
npx expo start --web        # opens http://localhost:8081
```

Set `EXPO_PUBLIC_API_URL=http://localhost:4000`.

## Demo accounts

Seeded by `npm run setup`. The login form starts **empty** — type the credentials yourself.

| Role | Email | Password |
|------|-------|----------|
| Kupac (buyer) | `ana@pijaca.rs` | `pijaca123` |
| Prodavac (seller) | `miroslav@pijaca.rs` | `pijaca123` |

You can also register a fresh account (it starts with no orders, listings, or notifications).
Switch persona from the profile screen: **Postani prodavac** / **Pređi na nalog kupca**.

## What is real vs mocked

- **Real (persisted in SQLite):** authentication & roles, products & markets, reservations and
  seller order management (confirm/decline), listings & discounts, recipes, receipts/history,
  donations, notifications, profile, and seller statistics (aggregated from confirmed orders).
- **Real device I/O:** camera (OCR scan, ad photo), gallery picker, microphone (voice ad entry).
- **Mocked processing (server-side, realistic shapes):** AI recipe generation, OCR receipt parsing,
  speech-to-text for the voice flow, surplus prediction, and the donation chatbot. These return
  canned data — no real ML/OCR/STT — but flow through the API like everything else.

## Scripts reference

**App** (`PiazzaPlus/`):

| Command | Description |
|---------|-------------|
| `npx expo run:android` | Build & install the Android dev client |
| `npx expo start --dev-client` | Start Metro for an installed dev build |
| `npx expo start --localhost` | Start Metro for Expo Go over `adb reverse` |
| `npx expo start --web` | Run in the browser |
| `npx tsc --noEmit` | Type-check the app |

**Server** (`PiazzaPlus/server/`):

| Command | Description |
|---------|-------------|
| `npm run setup` | `prisma generate` + `db push` + seed |
| `npm run dev` | Start API with auto-reload |
| `npm run seed` | Reseed the database |
| `npm run build` / `npm start` | Compile to `dist/` and run |

## Troubleshooting

- **`Failed to resolve the Android SDK path` / `adb: command not found`** — `ANDROID_HOME` isn't set
  or `platform-tools` isn't on `PATH`. Re-check the [Android setup](#android-sdk--android_home-setup)
  and reopen your terminal.
- **`Cannot connect to Expo CLI`** in the app — Metro isn't reachable. Ensure `npx expo start` is
  running and (on emulator/WSL) `adb reverse tcp:8081 tcp:8081` is set, then reload the app.
- **App shows "Nije moguće povezati se sa serverom"** — the API isn't reachable from the device.
  Confirm the server is running (`curl localhost:4000/api/health`), set `adb reverse tcp:4000 tcp:4000`,
  and use `EXPO_PUBLIC_API_URL=http://localhost:4000` (or `http://10.0.2.2:4000` on a native emulator).
  Restart Metro after editing `.env` (the value is inlined at bundle time).
- **WSL: Expo launches the wrong AVD / can't see the device** — boot the emulator yourself first
  (`emulator -avd <name>`), confirm `adb devices` lists it, then `npx expo start --localhost` and open
  the deep link shown in [Option B](#b-expo-go-lightweight--also-the-wsl-path).
- **Pressing the hardware Back button exits the app** on the login screen — that's Android's root-back;
  use the in-app navigation.
