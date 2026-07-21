import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const slip39 = require("slip39");

const PASSPHRASE = "TREZOR";

function bytesToHex(value) {
  if (typeof value === "string") {
    if (/^[0-9a-f]+$/iu.test(value)) return value.toLowerCase();
    return Buffer.from(value, "binary").toString("hex");
  }
  return Buffer.from(value).toString("hex");
}

const validVectors = [
  {
    name: "1. Valid mnemonic without sharing (128 bits)",
    shares: [
      "duckling enlarge academic academic agency result length solution fridge kidney coal piece deal husband erode duke ajar critical decision keyboard",
    ],
    secret: "bb54aac4b89dc868ba37d9cc21b2cece",
  },
  {
    name: "4. Basic sharing 2-of-3 (128 bits)",
    shares: [
      "shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed",
      "shadow pistol academic acid actress prayer class unknown daughter sweater depict flip twice unkind craft early superior advocate guest smoking",
    ],
    secret: "b43ceb7e57a0ea8766221624d01b0864",
  },
  {
    name: "17. Group threshold and member thresholds (128 bits)",
    shares: [
      "eraser senior decision roster beard treat identify grumpy salt index fake aviation theater cubic bike cause research dragon emphasis counter",
      "eraser senior ceramic snake clay various huge numb argue hesitate auction category timber browser greatest hanger petition script leaf pickup",
      "eraser senior ceramic shaft dynamic become junior wrist silver peasant force math alto coal amazing segment yelp velvet image paces",
      "eraser senior ceramic round column hawk trust auction smug shame alive greatest sheriff living perfect corner chest sled fumes adequate",
      "eraser senior decision smug corner ruin rescue cubic angel tackle skin skunk program roster trash rumor slush angel flea amazing",
    ],
    secret: "7c3397a292a5941682d7a4ae2d898d11",
  },
  {
    name: "20. Valid mnemonic without sharing (256 bits)",
    shares: [
      "theory painting academic academic armed sweater year military elder discuss acne wildlife boring employer fused large satoshi bundle carbon diagnose anatomy hamster leaves tracks paces beyond phantom capital marvel lips brave detect luck",
    ],
    secret: "989baf9dcaad5b10ca33dfd8cc75e42477025dce88ae83e75a230086a0e00e92",
  },
  {
    name: "23. Basic sharing 2-of-3 (256 bits)",
    shares: [
      "humidity disease academic always aluminum jewelry energy woman receiver strategy amuse duckling lying evidence network walnut tactics forget hairy rebound impulse brother survive clothes stadium mailman rival ocean reward venture always armed unwrap",
      "humidity disease academic agency actress jacket gross physics cylinder solution fake mortgage benefit public busy prepare sharp friar change work slow purchase ruler again tricycle involve viral wireless mixture anatomy desert cargo upgrade",
    ],
    secret: "c938b319067687e990e05e0da0ecce1278f75ff58d9853f19dcaeed5de104aae",
  },
];

const invalidVectors = [
  {
    name: "2. Invalid checksum",
    shares: [
      "duckling enlarge academic academic agency result length solution fridge kidney coal piece deal husband erode duke ajar critical decision kidney",
    ],
  },
  {
    name: "3. Invalid padding",
    shares: [
      "duckling enlarge academic academic email result length solution fridge kidney coal piece deal husband erode duke ajar music cargo fitness",
    ],
  },
  {
    name: "5. Insufficient shares for 2-of-3",
    shares: [
      "shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed",
    ],
  },
  {
    name: "6. Different identifiers",
    shares: [
      "adequate smoking academic acid debut wine petition glen cluster slow rhyme slow simple epidemic rumor junk tracks treat olympic tolerate",
      "adequate stay academic agency agency formal party ting frequent learn upstairs remember smear leaf damage anatomy ladle market hush corner",
    ],
  },
  {
    name: "11. Duplicate member indices",
    shares: [
      "device stay academic always dive coal antenna adult black exceed stadium herald advance soldier busy dryer daughter evaluate minister laser",
      "device stay academic always dwarf afraid robin gravity crunch adjust soul branch walnut coastal dream costume scholar mortgage mountain pumps",
    ],
  },
  {
    name: "13. Invalid digest",
    shares: [
      "guilt walnut academic acid deliver remove equip listen vampire tactics nylon rhythm failure husband fatigue alive blind enemy teaspoon rebound",
      "guilt walnut academic agency brave hamster hobo declare herd taste alpha slim criminal mild arcade formal romp branch pink ambition",
    ],
  },
];

for (const vector of validVectors) {
  const recovered = slip39.recoverSecret(vector.shares, PASSPHRASE);
  assert.equal(bytesToHex(recovered), vector.secret, `${vector.name}: recovered secret mismatch`);
  console.log(`✓ official valid vector: ${vector.name}`);
}

for (const vector of invalidVectors) {
  assert.throws(
    () => slip39.recoverSecret(vector.shares, PASSPHRASE),
    undefined,
    `${vector.name}: invalid vector must be rejected`,
  );
  console.log(`✓ official invalid vector rejected: ${vector.name}`);
}

console.log(`Official SLIP-39 vectors passed: ${validVectors.length} valid, ${invalidVectors.length} invalid.`);
