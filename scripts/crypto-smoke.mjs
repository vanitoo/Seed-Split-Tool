import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const bip39 = require("bip39");
const slip39 = require("slip39");
const secrets = require("secrets.js-grempe");
const scrypt = require("scryptsy");
const nacl = require("tweetnacl");

function bytesToHex(value) {
  if (typeof value === "string") {
    if (/^[0-9a-f]+$/iu.test(value)) return value.toLowerCase();
    return Buffer.from(value, "binary").toString("hex");
  }
  return Buffer.from(value).toString("hex");
}

function testBip39() {
  const entropy = "000102030405060708090a0b0c0d0e0f";
  const mnemonic = bip39.entropyToMnemonic(entropy);
  assert.equal(bip39.validateMnemonic(mnemonic), true, "BIP-39 mnemonic must validate");
  assert.equal(bip39.mnemonicToEntropy(mnemonic), entropy, "BIP-39 entropy round-trip failed");
}

function testSlip39() {
  const entropy = "000102030405060708090a0b0c0d0e0f";
  const masterSecret = Array.from(Buffer.from(entropy, "hex"));
  const tree = slip39.fromArray(masterSecret, {
    passphrase: "test-passphrase",
    threshold: 1,
    groups: [[2, 3]],
  });
  const shares = tree.fromPath("r/0").mnemonics;

  assert.equal(shares.length, 3, "SLIP-39 must create three shares");
  const recovered = slip39.recoverSecret(shares.slice(0, 2), "test-passphrase");
  assert.equal(bytesToHex(recovered), entropy, "SLIP-39 2-of-3 recovery failed");
}

function testGenericShamir() {
  const secretHex = "00112233445566778899aabbccddeeff";
  const shares = secrets.share(secretHex, 5, 3);
  assert.equal(shares.length, 5, "Generic Shamir must create five shares");
  assert.equal(secrets.combine([shares[0], shares[2], shares[4]]), secretHex, "Generic Shamir 3-of-5 recovery failed");
}

function testBananaPrimitives() {
  const plaintext = Buffer.from("seed split banana round trip", "utf8");
  const salt = Buffer.from("Seed Split Tool", "utf8");
  const password = "correct horse battery staple";
  const key = scrypt(password, salt, 1 << 15, 8, 1, 32);
  const nonce = new Uint8Array(24);
  nonce.set(Buffer.from("fixed-test-nonce-24bytes!", "utf8").subarray(0, 24));

  const encrypted = nacl.secretbox(new Uint8Array(plaintext), nonce, new Uint8Array(key));
  const encryptedHex = Buffer.from(encrypted).toString("hex");
  const shares = secrets.share(encryptedHex, 3, 2);
  const combined = secrets.combine([shares[0], shares[2]]);
  const decrypted = nacl.secretbox.open(
    new Uint8Array(Buffer.from(combined, "hex")),
    nonce,
    new Uint8Array(key),
  );

  assert.ok(decrypted, "Banana payload must decrypt with the correct password");
  assert.equal(Buffer.from(decrypted).toString("utf8"), plaintext.toString("utf8"), "Banana encrypted round-trip failed");

  const wrongKey = scrypt("wrong password", salt, 1 << 15, 8, 1, 32);
  const wrongResult = nacl.secretbox.open(
    new Uint8Array(Buffer.from(combined, "hex")),
    nonce,
    new Uint8Array(wrongKey),
  );
  assert.equal(wrongResult, null, "Banana payload must reject an incorrect password");
}

const checks = [
  ["BIP-39", testBip39],
  ["SLIP-39 2-of-3", testSlip39],
  ["Generic Shamir", testGenericShamir],
  ["Banana encrypted sharing", testBananaPrimitives],
];

for (const [name, check] of checks) {
  check();
  console.log(`✓ ${name}`);
}

console.log("All cryptographic smoke checks passed.");
