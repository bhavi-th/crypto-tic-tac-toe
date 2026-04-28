# CryptedVault — BMSIT × NFThing Web3 Workshop Fork

> Project-level context for any Claude session that opens in this folder.
> Read this before doing anything else here.

---

## What this repo is

This is the **canonical workshop fork** of the CryptedVault project — a decentralized encrypted file vault DApp.

It is the spine of a **two-day Web3 workshop** Kushal (NFThing) is delivering at **BMSIT Bengaluru** for CS/IT students. The workshop teaches Web3 from first principles by progressively building this exact codebase, branch by branch, over six teaching sessions.

Upstream reference: `https://github.com/kshitijofficial/cryptedVaultYT`
Workshop fork: `https://github.com/Shuklashashi0706/crypted_vault.git` (public)

---

## Workshop snapshot

| | |
|---|---|
| **Audience** | BMSIT CS/IT students. Web3 beginners. Frontend + backend basics ARE prerequisite. |
| **Schedule** | 2 full days, 9:00 AM – 4:00 PM. 6 teaching sessions. ~720 min total. |
| **Stack — frontend** | Vite + React 19 + Tailwind v4, **ethers v6**, axios, react-toastify, react-router v7 |
| **Stack — backend** | Express 5 + Mongoose 9, **ethers v6**, `pinata` SDK (new, not `@pinata/sdk`), jsonwebtoken, multer, AES-256-CBC via Node `crypto`. **ESM throughout.** |
| **Stack — contracts** | Solidity ^0.8.20, written and deployed via **Remix IDE** to **Sepolia testnet** |
| **Wallet** | MetaMask + Sepolia, funded from Google Cloud Sepolia faucet |
| **Outcome** | Every student walks out with a deployed DApp + an NFThing post |

✅ **No more version split** — both frontend and backend now use ethers v6. Old upstream split was eliminated during the migration.

---

## Where the rest of the workshop lives

All slides, runbooks, handouts, and planning artifacts are in the sibling folder:

```
C:\Users\nfthing\Desktop\BMSIT_PRESENTATION\
├── 01_Schedule_Overview/
├── 02_Day1_Session1_Web3_Foundations/    ← theory + wallet setup
├── 03_Day1_Session2_Smart_Contracts_Theory/
├── 04_Day1_Session3_Solidity_Deploy/     ← Solidity language deep-dive
├── 05_Day2_Session1_Solidity_HandsOn/    ← write Upload.sol + deploy to Sepolia
├── 06_Day2_Session2_Backend/             ← walk through full Express server
├── 07_Day2_Session3_Frontend_Deploy_QA/  ← walk MVP frontend + Q&A
├── 08_Code_Artifacts/
│   └── solidity_practice/                ← 8 progressive teaching contracts
├── 09_Handouts_For_Students/
│   └── EXPLORE_FURTHER.md                ← post-workshop roadmap
└── 10_Instructor_Runbooks/
```

If a session lands here and the user asks about slides/runbooks, point them to that folder first.

---

## Branch strategy

Branches are **starting states** for each session — students `git checkout` to catch up if they fall behind during the workshop.

| Branch | When | What it contains |
|---|---|---|
| `00-starter` | Start of D2S1 | Empty scaffolds: `client/`, `server/`, `contracts/` with package.json + configs. Placeholder `main.jsx`. No implementation. |
| `01-contract` | End of D2S1 | + `contracts/Upload.sol` (the project's smart contract, with teaching comments). Students wrote/AI-generated this in Remix and deployed to Sepolia. |
| `02-backend-done` | Start of D2S2 | + Full `server/`. Express 5 + ethers v6 + new Pinata SDK + AES-256-CBC + JWT. ESM. Postman-testable end-to-end. |
| `03-frontend-mvp` | End of D2S3 (working version) | + Minimal functional `client/`. Single-page MVP with Wallet → Home (Upload + Gallery). Theme + auto-restore preserved; no sidebar / stepper / modal / pagination. |
| `final_version` | Reveal at end | + Polished `client/`. Sidebar layout, AccountWidget popover (network, balance, switch, disconnect), 4-step animated UploadStepper, ImageModal, NetworkGuard, numbered Pagination, Vault page. |

**Rule:** branches advance forward only; students checkout, don't merge.

---

## Live-code vs branch-checkout strategy

| Session | Mode | Why |
|---|---|---|
| D1S3 (Solidity language) | **Type live in Remix** using practice contracts in `08_Code_Artifacts/solidity_practice/` (01–08) | Solidity syntax is short; muscle memory matters. |
| D2S1 (Solidity hands-on) | **Use AI to generate `Upload.sol`** — concept-first; deploy via Remix to Sepolia | Per workshop philosophy: AI as coding partner, instructor as concept connector. Students copy-modify-explain rather than type. |
| D2S2 (Backend) | **Checkout `02-backend-done` and walk through** | 135 min isn't enough to type Express + AES + Pinata + JWT. Walk-through teaches how the pieces connect. |
| D2S3 (Frontend) | **Checkout `03-frontend-mvp`; walk through; type 1-2 handlers live with AI** | Stay focused on Web3 mechanics (wallet connect, contract calls). Reveal `final_version` at end as "production polish". |

---

## Pedagogical philosophy

This is an **AI-native workshop** — Kushal will use AI live and asks students to use AI for code generation. Main focus is:

1. **Teach concepts** — not syntax memorization
2. **Connect dots** — how frontend, backend, contract, IPFS, MetaMask interact
3. **Share experience** — DOs and DON'Ts from production Web3 work
4. **Build confidence** — students leave knowing how to learn more, not knowing everything

The Solidity practice contracts in `08_Code_Artifacts/solidity_practice/` each end with a **CHALLENGE** prompt that students solve via AI — modeling AI-assisted Web3 development.

---

## Comment density rules

Two tiers (see `docs/COMMENT_GUIDE.md`):

- **Heavy** comments on Web3-specific code: `Upload.sol`, `connectWallet.js`, `authController.js`, `encryption.js`. Comment every non-trivial line — explain *why*, not just *what*.
- **Light** comments on standard web-stack code: Express routes, Mongo models, vanilla React. One docstring per file/function. No line-by-line.

---

## Known migration history

The upstream codebase had several issues — all **already fixed** in `final_version` (and propagated to other branches):

1. ✅ Contract address moved from hardcoded to `VITE_CONTRACT_ADDRESS` env var
2. ✅ `authenticateToken` now returns 401 (not 500) on missing/invalid token
3. ✅ Variable shadowing in `authController.js` fixed (renamed to `normalizedAddress`)
4. ✅ Backend CORS still wide-open (intentional — teaching moment about prod hardening)
5. ✅ Backend AES key still in MongoDB (intentional — teaching moment about full decentralization)
6. ✅ Migrated from `@pinata/sdk` (deprecated) to `pinata` (new SDK with JWT auth)
7. ✅ Backend converted from CommonJS to ESM
8. ✅ Backend ethers v5 → v6 (no more confusing version split)

---

## Quick conventions

- **Solidity files:** `contracts/*.sol`, license `SPDX-License-Identifier: GPL-3.0`, pragma `^0.8.0` to `<0.9.0`.
- **Backend env keys:** `MONGODB_URL`, `PORT`, `JWT_SECRETKEY`, `PINATA_JWT`. (Note: new SDK uses JWT, not API key/secret pair.)
- **Frontend env keys:** `VITE_API_URL`, `VITE_CONTRACT_ADDRESS`.
- **Default ports:** server `3000`, client (Vite default) `5173`.
- **Deploy targets:** Vercel (frontend), Render or Railway (backend). Instructor handles deployment — single shared demo, not per-student.

---

## When a session opens in this folder, you are likely…

1. Building or updating slide decks in the `BMSIT_PRESENTATION/` sibling folders
2. Writing instructor runbooks in `10_Instructor_Runbooks/`
3. Adjusting per-branch comments or fixing a bug discovered during dry-run
4. Updating the architecture diagram or handouts
5. Helping debug a student's local setup issue

The code itself is **stable** — major changes shouldn't be needed. If something looks broken, check the env vars first.
