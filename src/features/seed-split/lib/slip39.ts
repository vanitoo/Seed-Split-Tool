import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from "bip39";
import slip39 from "slip39";

export function splitSlip39(mnemonic: string, total: number, threshold: number, passphrase: string): string[] {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/gu, " ");
  if (!validateMnemonic(normalized)) {
    throw new Error("SLIP-39 принимает корректную английскую BIP-39 seed-фразу из 12, 15, 18, 21 или 24 слов");
  }
  const entropyHex = mnemonicToEntropy(normalized);
  const tree = slip39.fromArray(entropyHex, {
    passphrase,
    threshold: 1,
    groups: [[threshold, total]],
  });
  return tree.fromPath("r/0").mnemonics;
}

export function recoverSlip39(shares: string[], passphrase: string): string {
  if (shares.length === 0) throw new Error("Добавьте части SLIP-39");
  const entropyHex = slip39.recoverSecret(shares.map((share) => share.trim()), passphrase);
  if (!/^[0-9a-f]+$/iu.test(entropyHex)) throw new Error("SLIP-39 вернул некорректный секрет");
  return entropyToMnemonic(entropyHex);
}
