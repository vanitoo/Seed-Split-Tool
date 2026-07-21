import { entropyToMnemonic, wordlists } from "bip39";
import slip39 from "slip39";
import { type Bip39Language, mnemonicToBip39Entropy } from "./bip39-tools";

function getWordlist(language: Bip39Language): string[] {
  const list = wordlists[language];
  if (!list) throw new Error(`BIP-39 словарь ${language} недоступен`);
  return list;
}

function hexToBytes(hex: string): number[] {
  if (!/^[0-9a-f]+$/iu.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Некорректная entropy BIP-39");
  }
  const bytes: number[] = [];
  for (let index = 0; index < hex.length; index += 2) {
    bytes.push(Number.parseInt(hex.slice(index, index + 2), 16));
  }
  return bytes;
}

function bytesToHex(bytes: ArrayLike<number>): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function splitSlip39(mnemonic: string, total: number, threshold: number, passphrase: string): string[] {
  const { entropy } = mnemonicToBip39Entropy(mnemonic);
  const tree = slip39.fromArray(hexToBytes(entropy), {
    passphrase,
    threshold: 1,
    groups: [[threshold, total]],
  });
  return tree.fromPath("r/0").mnemonics;
}

export function recoverSlip39(shares: string[], passphrase: string, language: Bip39Language = "english"): string {
  if (shares.length === 0) throw new Error("Добавьте части SLIP-39");
  const recovered = slip39.recoverSecret(shares.map((share) => share.trim()), passphrase);
  const entropyHex = bytesToHex(recovered);
  if (![32, 40, 48, 56, 64].includes(entropyHex.length)) {
    throw new Error("SLIP-39 восстановил секрет неожиданной длины");
  }
  return entropyToMnemonic(entropyHex, getWordlist(language));
}
