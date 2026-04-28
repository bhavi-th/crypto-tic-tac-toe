# Comment Guide — CryptedVault Workshop Code

How to write code comments for this workshop. Comments are the only "self-study material" students take home, so they need to teach.

---

## Two tiers — choose per file

### TIER A — HEAVY (every non-trivial line gets a note)

Apply to files that introduce **Web3-specific concepts students have never seen**:

- `contracts/Upload.sol` — Solidity is brand new
- `client/src/utils/connectWallet.js` — ethers v6 patterns, signing flow
- `server/controllers/authController.js` — signature verification
- `server/utils/encryption.js` — AES-256-CBC primitive
- `server/utils/decryption.js`

Comment style: explain **why**, not **what**.

```js
// ❌ TOO LIGHT — just restates the code
const signer = await provider.getSigner();

// ❌ TOO HEAVY — patronising
// We are getting the signer from the provider. The signer is a thing
// that signs. We get it asynchronously because it returns a promise.

// ✅ JUST RIGHT — explains the why + the gotcha
// In ethers v6, getSigner() is async because it might prompt MetaMask
// to unlock. The signer wraps the user's account and is what we use to
// sign messages and send transactions.
const signer = await provider.getSigner();
```

### TIER B — LIGHT (file-level + non-obvious lines only)

Apply to files using **standard web stack** patterns students should already know (frontend/backend basics ARE prereqs for this workshop):

- Express route files
- Mongoose models
- Vanilla React components without contract integration
- Vite/Tailwind/Postcss configs

One docstring at the top of the file or function. Skip line-by-line.

```js
// ✅ TIER B — just the file-level header
/**
 * MongoDB User schema.
 * One document per wallet address. encryptionKey is generated lazily
 * on first upload, then reused for that user's subsequent uploads.
 */
```

---

## Session markers

Whenever a file is modified between two workshop branches, mark the new/changed block with a session header:

```js
// === SESSION 5 — JWT signature auth flow ===
// We added this controller in Block 5. It verifies the signed
// "Welcome to Crypto Vault" message and issues a JWT if valid.
async function authController(req, res) {
  // ...
}
```

Format: `// === SESSION <N> — <topic> ===`

This lets students `grep -r "SESSION 5"` to find every change in Block 5 across the codebase. Keep markers minimal — one per logical block, not one per line.

---

## Standard tags

Use these tags consistently so students can search:

| Tag | Use for |
|---|---|
| `// SECURITY:` | Anything that's a security note (e.g., "never log private keys") |
| `// GOTCHA:` | Something non-obvious that bites people (e.g., ethers v5 vs v6 difference) |
| `// TODO(workshop):` | Things deliberately left simple for the workshop, with a note on what production code would do |
| `// TRY THIS:` | Suggested student exercise inline with the code |

Examples:

```js
// SECURITY: Never log the private key. Even in dev. It ends up in
// log files which end up in git which end up on the internet.
const signer = wallet.connect(provider);
```

```js
// GOTCHA: Server uses ethers v5 (utils.verifyMessage), client uses v6
// (verifyMessage at top level). If you copy code between, the API differs.
const recovered = ethers.utils.verifyMessage(MSG, signature);
```

```js
// TODO(workshop): For the workshop we store the encryption key in
// MongoDB so the backend can decrypt on read. In a real app you'd
// derive the key client-side from a user-controlled secret so the
// backend never sees plaintext keys.
user.encryptionKey = generateEncryptionKey(32);
```

```js
// TRY THIS: Add a `deleteFile(string memory _ipfsHash)` function to
// the contract. Hint: you'll need to find and remove from the array.
function uploadFile(...) { ... }
```

---

## What NOT to do

- ❌ **Don't paraphrase the code.** `// add 1 to counter` next to `counter++` adds nothing.
- ❌ **Don't write essays.** Comment > 3 lines? Move it to the file's docstring or a `docs/` page.
- ❌ **Don't comment console.logs and debugger statements.** Remove them.
- ❌ **Don't leave commented-out code blocks.** If it's worth keeping, put it in a "TRY THIS" block. Otherwise delete.
- ❌ **Don't use emoji or jokes in comments** — they age badly and don't translate well across cultures. The slide deck is the place for tone; the code is the place for clarity.
- ❌ **Don't comment in shorthand.** Students Google their first error in the workshop; legible comments help future-them.

---

## Examples of good vs bad — Solidity

```solidity
// ❌ BAD — restates the code
contract Upload {
    // a mapping of address to string array
    mapping(address => string[]) private userFiles;
}

// ✅ GOOD — explains the design choice
contract Upload {
    // Each wallet address gets its own list of IPFS hashes.
    // We use `private` so the variable isn't auto-exposed via a
    // public getter — viewFiles() is our controlled accessor instead.
    mapping(address => string[]) private userFiles;
}
```

```solidity
// ❌ BAD
function uploadFile(address _user, string memory _ipfsHash) external {
    // push to array
    userFiles[_user].push(_ipfsHash);
}

// ✅ GOOD
function uploadFile(address _user, string memory _ipfsHash) external {
    // GOTCHA: We accept _user as a parameter rather than using msg.sender
    // because in our backend flow, the server sometimes calls on behalf
    // of the user. In a stricter model you'd require msg.sender == _user
    // here too — TRY THIS yourself as an exercise.
    userFiles[_user].push(_ipfsHash);
}
```

---

## Examples of good vs bad — JS

```js
// ❌ BAD
const signature = await signer.signMessage(message);

// ✅ GOOD (in connectWallet.js — Tier A file)
// Triggers a MetaMask popup asking the user to sign this exact string.
// The signature is cryptographic proof that whoever holds the private
// key for `selectedAccount` agreed to "Welcome to Crypto Vault Website".
// The backend will recover the address from the signature and compare.
const signature = await signer.signMessage(message);
```

```js
// ✅ Tier B — Express route. One-line file docstring is enough.
/** Auth route — POST /api/authentication, body: { signature }, query: ?address=0x... */
const router = express.Router();
router.post("/authentication", authController);
module.exports = router;
```

---

## Heavy-comment density target

A reasonable rule of thumb:

| File | Roughly |
|---|---|
| `contracts/Upload.sol` (~30 lines code) | ~20 lines of comments |
| `connectWallet.js` (~30 lines code) | ~25 lines of comments |
| `authController.js` (~35 lines code) | ~25 lines of comments |
| `encryption.js` (~15 lines code) | ~15 lines of comments |

Don't pad — but in these files comments will roughly equal code lines. That's the point.
