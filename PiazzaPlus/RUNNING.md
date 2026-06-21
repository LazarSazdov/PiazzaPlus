# Running Pijaca Plus

Full setup and run instructions — backend, app config, Android/`ANDROID_HOME` setup,
emulator / Expo Go / web, demo accounts, and troubleshooting — live in **[README.md](./README.md)**.

Quick start:

```bash
# 1) API
cd server && npm install && npm run setup && npm run dev   # http://localhost:4000

# 2) App (new terminal, from PiazzaPlus/)
cp .env.example .env        # set EXPO_PUBLIC_API_URL (see README)
npm install
npx expo run:android        # or the Expo Go / web paths in the README
```
