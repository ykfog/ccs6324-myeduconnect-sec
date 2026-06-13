# MyEduConnect Companion App (React Native / Expo)

This is the **additional component** for Phase 1 (companion mobile app)
of the CCS6324 Final Assignment. It is a separate Expo/React Native client
that talks to the backend REST API on port `8080`.

## Setup

```bash
cd mobile-app
npm install
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator), or scan the QR
code with Expo Go on a physical device.

## Configuring the backend URL

Edit `src/api/client.js` and set `API_BASE_URL`:

| Environment | URL |
|---|---|
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device on same LAN | `http://<host-machine-LAN-IP>:8080` |
| Docker host (deployed) | `http://<docker-host-ip>:8080` |

## Vulnerable / Safe Mode Toggle

Every screen has a pill button top-left: **VULNERABLE MODE** / **SAFE MODE**.
Tapping it flips a global flag sent as the `X-Mode` header on every API
request. The backend (`backend/server.js`) implements **both** behaviours
for the same endpoints:

| Endpoint | Vulnerable mode | Safe mode |
|---|---|---|
| `POST /api/login` | SQL injection via string concatenation; sequential predictable session token | Parameterized query + bcrypt compare; 256-bit random token |
| `POST /api/register` | MD5 password hash | bcrypt (12 rounds) |
| `GET /api/profile/:id` | IDOR — no ownership check, any user can view any profile | 403 Forbidden unless requesting own profile |
| `POST /api/courses/:id/comment` | Comment stored unsanitized (stored XSS on web frontend) | Comment HTML-escaped before storage |

### Demo flow for Phase 4 / Phase 7

1. Set mode to **Vulnerable**.
2. Login screen → username `' OR '1'='1' -- -`, any password → authentication bypass (SQLi).
3. Profile screen → log in normally, then change the "View profile by ID" field to another user's ID → IDOR, view their bio.
4. Course Detail screen → post a comment containing `<script>alert(document.cookie)</script>` → view the same course on the **web** platform to see the stored XSS execute.
5. Flip to **Safe Mode** and repeat steps 2–4 to demonstrate the same requests now fail / are blocked (Phase 5 re-test evidence).

## Notes

- `node_modules/` is gitignored — run `npm install` after cloning.
- The app uses React Navigation (native stack). No backend changes are
  required beyond what's in `backend/server.js` and `backend/Dockerfile`
  (added `bcryptjs` dependency).
