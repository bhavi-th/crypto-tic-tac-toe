# Workshop Branch Plan — CryptedVault

This file documents the **6-branch progression** that mirrors the workshop's 6 teaching blocks. Each branch is a checkpoint students can `git checkout` to catch up if they fall behind.

---

## Quick map

```
00-starter ──► 01-contract-basic ──► 02-contract-extended ──► 03-backend-done ──► 04-frontend-integrated ──► main
   ▲              ▲                       ▲                       ▲                       ▲                ▲
Block 2        Block 3                 Block 4                 Block 5                 Block 6        After workshop
```

Branches advance forward only. Students `git pull` or `git checkout` — never merge backwards.

---

## How these branches relate to the upstream reference

The current state of this repo (`IpfsStorage.sol`, full `client/`, full `server/`) is roughly equivalent to `04-frontend-integrated`. To create the earlier branches we **strip back** from this state:

1. Tag current state as a starting point (`git tag pre-workshop-strip`).
2. Build `00-starter` by creating an empty parallel branch with only scaffolding.
3. Build the rest by progressively adding files / re-introducing implementation.

The order doesn't have to match the workshop — these are checkpoints, not the build journey itself.

---

## Branch 00 — `00-starter`

**Where:** End of Block 2 (after architecture + Solidity theory). Block 3 starts here.

**Contents:**
- `README.md` — workshop overview, branch guide, prereq link.
- `LICENSE`
- `.gitignore` — Node, Vite, env files, build output
- `.env.example` — placeholder keys with explanation comments
- `contracts/` — empty directory + `.gitkeep`
- `client/` — Vite + React + Tailwind scaffold:
  - `package.json` with deps installed (ethers v6, react-router, axios, react-hot-toast, lucide-react)
  - `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
  - `src/main.jsx`, `src/App.jsx` (just renders "CryptedVault — coming soon")
  - `src/index.css` with Tailwind directives + the gradient style
- `server/` — Express scaffold:
  - `package.json` with deps installed (express, cors, dotenv, mongoose, jsonwebtoken, multer, ethers v5, @pinata/sdk)
  - `index.js` — boots Express on PORT, prints "Server listening", connects MongoDB
  - `config/serverConfig.js` — pulls env vars
  - `db/connect.js` — Mongoose connection helper
- `docs/`
  - `WORKSHOP_BRANCH_PLAN.md` (this file)
  - `COMMENT_GUIDE.md`

**What students do here:** clone, `npm install` in both folders, run `npm start` / `npm run dev` to confirm scaffolding boots. Then they head to Remix in Block 3.

---

## Branch 01 — `01-contract-basic`

**Where:** End of Block 3 (Solidity hands-on + first deploy).

**New files (vs. 00-starter):**
- `contracts/Upload.sol` — basic version:
  ```solidity
  // SPDX-License-Identifier: GPL-3.0
  pragma solidity ^0.8.0;

  contract Upload {
      mapping(address => string[]) private userFiles;

      function uploadFile(address _user, string memory _ipfsHash) external {
          userFiles[_user].push(_ipfsHash);
      }

      function viewFiles(address _user) external view returns (string[] memory) {
          return userFiles[_user];
      }
  }
  ```
- `contracts/README.md` — explains the mapping, why we need `external`, what `string[]` storage looks like

**Modified files:**
- `client/src/constants/contractAbi.json` — populated with this version's ABI

**Key teaching points (heavy comments in `Upload.sol`):**
- Why `mapping(address => string[])` not `map<addr, list>` like other languages?
- Why `private` instead of `public`?
- Why `memory` keyword on `_ipfsHash`?
- Why `external` not `public`?
- Why `view` on `viewFiles`?

**What students do here:** open Remix, paste/type `Upload.sol`, compile, deploy via Injected Provider (MetaMask), confirm tx, copy contract address into `.env` as `VITE_CONTRACT_ADDRESS`.

---

## Branch 02 — `02-contract-extended`

**Where:** End of Block 4 (hands-on Solidity workshop, deeper concepts).

**Modified files (vs. 01):**
- `contracts/Upload.sol` — extended:
  - `event FileUploaded(address indexed user, string ipfsHash)` emitted in `uploadFile`
  - `modifier onlyOwnerAccess(address _user)` requiring `msg.sender == _user`
  - `viewFiles` now uses the modifier
  - Maybe a `getFileCount(address) view returns (uint)` helper to demonstrate another return type
- `client/src/constants/contractAbi.json` — updated ABI

**Key teaching points (added comments):**
- Why `event` matters — frontend can listen, on-chain audit trail, cheaper than storage
- `indexed` parameter — searchable in event logs
- `modifier` — DRY for require checks
- `msg.sender` — the EOA calling the function
- Storage vs memory vs calldata — when to use each

**What students do here:** redeploy the extended contract, update env with new address, re-export ABI.

---

## Branch 03 — `03-backend-done`

**Where:** End of Block 5 (backend walkthrough + run locally).

**New / modified files (vs. 02):**

- `server/index.js` — full Express boot:
  - CORS, JSON middleware, route registration
- `server/routes/`
  - `authenticationRoute.js`
  - `uploadImageRoute.js` (uses `authenticateToken` + `uploadUserImage`)
  - `getImageRoute.js` (uses `authenticateToken`)
- `server/controllers/`
  - `authController.js` — **HEAVY COMMENTS**: signature recovery, JWT issuance
  - `uploadImageController.js` — **HEAVY COMMENTS**: AES encryption, Pinata pinJSONToIPFS
  - `getImageController.js` — pagination, decryption, base64 response
- `server/middleware/`
  - `authenticateToken.js` — JWT verify; `req.address = decoded.address`
  - `multer.js` — memory storage for in-RAM file handling
- `server/models/User.js` — Mongoose schema (userAddress, encryptionKey, createdAt)
- `server/utils/`
  - `encryption.js` — AES-256-CBC encrypt with random IV — **HEAVY COMMENTS**
  - `decryption.js` — corresponding decrypt
  - `generateKey.js` — random 32-byte key as hex

**Bug fixes vs upstream:**
- `authenticateToken` returns `401` on missing token (was 500)
- CORS allowlist (workshop dev: localhost:5173 only)

**What students do here:** copy `.env.example` → `.env`, fill in MongoDB Atlas + Pinata + JWT secret, `npm start`, hit `/api/authentication` from Postman with a signed message, see JWT in response.

---

## Branch 04 — `04-frontend-integrated`

**Where:** Mid-Block 6 (after frontend walkthrough + integration).

**New / modified files (vs. 03):**

- `client/src/contexts/`
  - `createWeb3Context.jsx` — `createContext` only
  - `Web3Provider.jsx` — provider with `web3State` (`contractInstance`, `selectedAccount`) + updater
  - `useWeb3Context.jsx` — `useContext` hook
- `client/src/utils/connectWallet.js` — **HEAVY COMMENTS**:
  - Request accounts → `BrowserProvider` → `getSigner()` → `signMessage()` → POST to `/api/authentication` → store JWT in localStorage → instantiate `ethers.Contract`
  - Contract address from `import.meta.env.VITE_CONTRACT_ADDRESS` (NOT hardcoded)
- `client/src/pages/`
  - `Wallet.jsx` — landing page, "Connect Wallet" button, redirects to `/home` after connect
  - `Home.jsx` — wraps `UploadImage` + `GetImage`
- `client/src/components/`
  - `Navbar.jsx` — connected account chip
  - `ConnectedAccount.jsx` — shows wallet address
  - `UploadImage.jsx` — file picker → POST `/api/uploadImage` (with `x-access-token`) → on-chain `uploadFile(addr, hash)` via `contractInstance`
  - `GetImage.jsx` — calls `contractInstance.viewFiles(addr)` → POST hashes to `/api/getImage` → renders decrypted base64 images with pagination
- `client/src/routes/routes.jsx` — react-router config
- `client/src/main.jsx` — `<Toaster/>`, `<App/>`
- `client/src/constants/contractAbi.json` — final ABI
- `client/.env.example` — `VITE_API_URL`, `VITE_CONTRACT_ADDRESS`

**Optional 1–2 functions students implement live:**
- `Wallet.jsx::handleWalletConnection` (lets them "feel" the connect flow)
- `UploadImage.jsx::handleImageUpload` (the moneyshot — they call their own contract)

**What students do here:** start backend (`server/`) + frontend (`client/`) locally, click "Connect Wallet", sign the message, upload an image, verify the IPFS hash on-chain via Etherscan.

---

## Branch main (= `05-final`)

**Where:** After workshop. Polished version for ongoing reference / portfolio.

**Polishes:**
- README rewritten with workshop completion notes + screenshots
- Env hardening (rate-limited CORS allowlist, JWT expiry)
- Vercel + Render deploy configs (`vercel.json`, `render.yaml` if used)
- Tests stub (jest + supertest) — even if just one happy-path test
- Maybe a Hardhat config alongside Remix for students who want to keep building

---

## How to actually create these branches (suggested workflow)

> Run in your terminal — Claude in this folder can guide but won't push for you.

```bash
# 0. Stash the current full state as a tag
git init && git add . && git commit -m "Initial: upstream cryptedVaultYT"
git tag pre-workshop-strip

# 1. Create the workshop branches in reverse (easier — strip from full)
git checkout -b 04-frontend-integrated
# (this is the current state, just make any client/ env-var fixes here)

git checkout -b 03-backend-done
# rm -rf client/src/components client/src/pages client/src/contexts client/src/utils
# Keep client scaffolding only
git commit -am "Strip frontend implementation — checkpoint after Block 5"

git checkout -b 02-contract-extended
# rm -rf server/controllers server/utils/encryption.js etc.
# Keep server scaffolding only
git commit -am "Strip backend implementation — checkpoint after Block 4"

git checkout -b 01-contract-basic
# Replace contracts/Upload.sol with the basic version
git commit -am "Strip contract to basic version — checkpoint after Block 3"

git checkout -b 00-starter
# Remove contracts/Upload.sol; add .gitkeep
git commit -am "Empty starter — checkpoint at Block 3 start"

# 2. Push all branches
git remote add origin <kushal's-repo-url>
git push origin --all
```

Have a future Claude session in this folder script this for you if you want it automated.

---

## Per-branch README pattern

Each branch should have a `BRANCH_README.md` (or update the root README) with this template:

```markdown
# Branch: <branch-name>

**Workshop checkpoint:** <Block X>
**Previous branch:** <prev>
**Next branch:** <next>

## What's new vs previous
- File X added: <one-line description>
- File Y modified: <what changed>

## Key concepts demonstrated
- <concept 1>
- <concept 2>

## Try this yourself (homework)
- <exercise 1>
- <exercise 2>
```

This makes the repo navigable post-workshop for self-study.
