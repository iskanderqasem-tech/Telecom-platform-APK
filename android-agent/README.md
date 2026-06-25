# Telecom Android Agent v1

Android Agent for Telecom Test Platform v2.

## What this Agent does

- Login to the Telecom Test Platform backend
- Register the handset/device
- Open WebSocket connection to backend
- Send heartbeat every 30 seconds
- Receive `RUN_TEST` commands
- Execute initial telecom test actions:
  - `VOICE_CALL`: opens/places outgoing call using Android dial/call intent
  - `SMS`: sends SMS using `SmsManager`
  - `DATA`: performs HTTP/HTTPS GET and records response time/status
- Upload result back to backend using WebSocket `RESULT` message

## Backend URLs for your Render deployment

API URL:

```text
https://telecom-platform-apk.onrender.com
```

WebSocket URL:

```text
wss://telecom-platform-apk.onrender.com/ws
```

## Important permissions

This app requests:

- INTERNET
- CALL_PHONE
- SEND_SMS
- READ_PHONE_STATE
- POST_NOTIFICATIONS on Android 13+
- FOREGROUND_SERVICE

For a real outgoing call, Android may still ask the user to confirm/allow call permission depending on device policy.
SMS charges may apply when running real SMS tests.

## Install / build options

### Option A - Android Studio

1. Open Android Studio.
2. Open this folder: `android-agent-v1`.
3. Wait for Gradle sync.
4. Connect your handset by USB for the first install.
5. Click Run.
6. Grant permissions on the handset.
7. Enter:
   - API URL: `https://telecom-platform-apk.onrender.com`
   - WS URL: `wss://telecom-platform-apk.onrender.com/ws`
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - Device Identifier: exactly the same value as the portal device, e.g. `phone-a` or `phone-b`
8. Tap Login.
9. Tap Register Device.
10. Tap Connect WebSocket.
11. In the web portal, the device should become ONLINE.
12. Run your test case from the portal.

### Option B - Copy into your existing GitHub repository

Replace the existing `android-agent` folder in your GitHub project with this project if you want to keep everything in one monorepo.

Recommended folder name in repo:

```text
android-agent
```

Then push:

```powershell
git add android-agent
git commit -m "Add Android Agent v1"
git push
```

## Test case configuration examples

### Voice call

```json
{
  "targetNumber": "+64224794052",
  "durationSeconds": 10
}
```

### SMS

```json
{
  "targetNumber": "+64224794052",
  "message": "Telecom test SMS from Android Agent v1"
}
```

### Data

```json
{
  "url": "https://www.google.com"
}
```

## Notes

- For fully automatic MT call answer, Android usually requires default dialler / enterprise device owner configuration.
- This v1 focuses on MO call, SMS send, data test, heartbeat and WebSocket result upload.
- Make sure the Device Identifier in the app matches the Device Identifier in the web portal. Example: if the portal device is `phone-a`, the app must register/connect as `phone-a`.
