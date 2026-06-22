# Pijaca Plus — running it on Ubuntu (from scratch)

A complete, copy‑paste guide to get **Pijaca Plus** running on a fresh Ubuntu machine. It has two
parts that run at the same time:

- **API server** — Node + Express + SQLite (`PiazzaPlus/server/`), serves on `http://localhost:4000`.
- **Mobile app** — Expo / React Native (`PiazzaPlus/`), runs on an Android phone or emulator.

The app uses only first‑party Expo modules, so it runs in **Expo Go** — no Android app build needed.
The two map screens use **OpenStreetMap**, so the device needs **internet** (Wi‑Fi/data) to load tiles.

> Paths below are written **from the repository root** (the folder you get after `git clone`). The
> app is in `PiazzaPlus/` and the server in `PiazzaPlus/server/`.

---

## 0. TL;DR (if you already have Node + adb + a phone with Expo Go)

```bash
# terminal 1 — backend
cd PiazzaPlus/server && npm install && npm run setup && npm run dev

# terminal 2 — app
cd PiazzaPlus
cp .env.example .env                       # EXPO_PUBLIC_API_URL=http://localhost:4000  (default)
npm install
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
npx expo start                              # press 'a' to open on the connected Android device
```

Log in with `ana@pijaca.rs` / `pijaca123` (buyer) or `miroslav@pijaca.rs` / `pijaca123` (seller).

The rest of this document explains every step from a clean Ubuntu install.

---

## 1. Get the code

```bash
git clone <YOUR_REPO_URL> pijaca-plus
cd pijaca-plus
```

(Replace `<YOUR_REPO_URL>` with the GitHub URL.)

---

## 2. Install prerequisites

### 2.1 Node.js 20 + npm

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # should print v20.x
```

### 2.2 Android platform‑tools (`adb`)

You always need `adb` (to talk to the phone/emulator). The quickest way is Google's standalone
platform‑tools:

```bash
sudo apt install -y unzip wget
mkdir -p ~/Android
wget -O /tmp/pt.zip https://dl.google.com/android/repository/platform-tools-latest-linux.zip
unzip -o /tmp/pt.zip -d ~/Android
```

Add it to your `PATH` (append to `~/.bashrc`, then `source ~/.bashrc`):

```bash
echo 'export ANDROID_HOME="$HOME/Android/Sdk"' >> ~/.bashrc
echo 'export PATH="$PATH:$HOME/Android/platform-tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin"' >> ~/.bashrc
source ~/.bashrc
adb version    # should print a version
```

> If you only ever use a **physical phone**, platform‑tools (`adb`) is all you need — skip Android
> Studio and JDK below. Install Android Studio only if you want an **emulator**.

### 2.3 (Only for an emulator) Android Studio + KVM + an AVD

```bash
# Android Studio (gives you the SDK, an Android system image, and an emulator)
sudo snap install android-studio --classic

# KVM — the Android emulator needs hardware acceleration on Linux
sudo apt install -y qemu-kvm libvirt-daemon-system cpu-checker
sudo adduser "$USER" kvm
kvm-ok        # should say "KVM acceleration can be used"  (re-login if it complains about permissions)
```

Open **Android Studio → More Actions → SDK Manager** and install an **SDK Platform** (API 34/35/36)
and the **Android Emulator**. Then **More Actions → Virtual Device Manager → Create device** (e.g.
Pixel 7, a recent API level — pick a **Google Play** image so you can install Expo Go from the store).
Android Studio installs the SDK to `~/Android/Sdk` (matches `ANDROID_HOME` above).

### 2.4 (Only for a native dev build, optional) JDK 17

Expo Go does **not** need this. Install it only if you later want `npx expo run:android` (a full
native build):

```bash
sudo apt install -y openjdk-17-jdk
```

---

## 3. Start the backend (API)

```bash
cd PiazzaPlus/server
npm install
npm run setup      # creates + seeds the SQLite database (first time only)
npm run dev        # serves on http://localhost:4000  (leave this terminal running)
```

Quick check (new terminal): `curl http://localhost:4000/api/health` → `{"ok":true,...}`.
To re-seed later: `npm run seed`.

---

## 4. Configure the app

In a **second terminal**, from the repo root:

```bash
cd PiazzaPlus
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `.env` to whatever the **device** uses to reach your computer:

| How you run the app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Phone or emulator with `adb reverse tcp:4000` (recommended) | `http://localhost:4000` |
| Android emulator, no reverse | `http://10.0.2.2:4000` |
| Phone on the same Wi‑Fi, no reverse | `http://<your-computer-LAN-IP>:4000` |

`http://localhost:4000` (the default in `.env.example`) works for both phone and emulator as long as
you run the two `adb reverse` commands in the next step.

---

## 5. Run the app

### Option A — Physical Android phone (easiest)

1. On the phone, install **Expo Go** from the Google Play Store.
2. Enable developer mode: **Settings → About phone → tap "Build number" 7×**, then
   **Settings → System → Developer options → enable "USB debugging"**.
3. Connect the phone by USB and accept the "Allow USB debugging?" prompt.
4. From `PiazzaPlus/`:

```bash
adb devices                       # your phone should be listed as "device"
adb reverse tcp:8081 tcp:8081     # Metro
adb reverse tcp:4000 tcp:4000     # API
npx expo start
```

5. Press **`a`** in the terminal to open the app in Expo Go (or scan the QR code with Expo Go).

### Option B — Android emulator

```bash
# list your virtual devices and boot one
emulator -list-avds
emulator -avd <NAME_FROM_THE_LIST> &

# wait until it's booted, then from PiazzaPlus/:
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
npx expo start
```

Press **`a`** to open on the emulator. The first time, Expo CLI installs Expo Go automatically (or
install it from the Play Store on a Google Play AVD).

> Tip: keep `EXPO_PUBLIC_API_URL=http://localhost:4000` and always run the two `adb reverse` commands
> after the device/emulator is connected (re-run them if you reconnect).

---

## 6. Demo accounts

The login screen starts empty — type the credentials. Seeded by `npm run setup`:

| Role | Email | Password |
|---|---|---|
| Kupac (buyer) | `ana@pijaca.rs` | `pijaca123` |
| Prodavac (seller) | `miroslav@pijaca.rs` | `pijaca123` |

You can also tap **Registracija** to make a fresh account. After login you're in the buyer flow;
to reach the seller flow open **Moj profil → Postani prodavac** (and **Pređi na nalog kupca** to go back).

---

## 7. Troubleshooting

- **`adb: command not found`** — platform‑tools isn't on `PATH`; redo step 2.2 and `source ~/.bashrc`.
- **App shows "Nije moguće povezati se sa serverom"** — the API isn't reachable. Make sure
  `npm run dev` is running, you ran `adb reverse tcp:4000 tcp:4000`, and `.env` is
  `http://localhost:4000`. Restart `npx expo start` after editing `.env` (the value is baked in at
  bundle time).
- **"Cannot connect to Expo CLI" / blank app** — Metro not reachable; ensure `npx expo start` is
  running and `adb reverse tcp:8081 tcp:8081` is set, then reload (shake device → Reload, or press
  `r` in the terminal).
- **Maps are blank** — the OpenStreetMap tiles need internet on the **device**; check the phone/
  emulator has Wi‑Fi/data.
- **Emulator won't start / is very slow** — KVM isn't enabled; redo step 2.3 (`kvm-ok` must pass) and
  log out/in so the `kvm` group membership applies.
- **`adb devices` shows "unauthorized"** — accept the USB‑debugging prompt on the phone (toggle USB
  debugging off/on if no prompt appears).
- **Port already in use (4000/8081)** — something is already running; stop it
  (`kill $(lsof -t -i:4000)`), or change the port.

---

That's it. Backend in one terminal (`npm run dev`), app in another (`npx expo start` → `a`), phone/
emulator with Expo Go, and you're testing Pijaca Plus.
