import { entropyToMnemonic, wordlists } from "bip39";
import slip39 from "slip39";
import { type Bip39Language, mnemonicToBip39Entropy } from "./bip39-tools";

function getWordlist(language: Bip39Language): string[] {
  const list = wordlists[language];
  if (!list) throw new Error(`BIP-39 словарь ${language} недоступен`);
  return list;
}

export function splitSlip39(mnemonic: string, total: number, threshold: number, passphrase: string): string[] {
  const { entropy } = mnemonicToBip39Entropy(mnemonic);
  const tree = slip39.fromArray(entropy, {
    passphrase,
    threshold: 1,
    groups: [[threshold, total]],
  });
  return tree.fromPath("r/0").mnemonics;
}

export function recoverSlip39(shares: string[], passphrase: string, language: Bip39Language = "english"): string {
  if (shares.length === 0) throw new Error("Добавьте части SLIP-39");
  const entropyHex = slip39.recoverSecret(shares.map((share) => share.trim()), passphrase);
  if (!/^[0-9a-f]+$/iu.test(entropyHex)) throw new Error("SLIP-39 вернул некорректный секрет");
  return entropyToMnemonic(entropyHex, getWordlist(language));
}
