declare module "slip39" {
  type Slip39Node = { mnemonics: string[] };
  type Slip39Tree = { fromPath(path: string): Slip39Node };
  const slip39: {
    fromArray(secretHex: string, options: { passphrase?: string; threshold: number; groups: [number, number][] }): Slip39Tree;
    recoverSecret(mnemonics: string[], passphrase?: string): string;
  };
  export = slip39;
}

declare module "scryptsy" {
  export default function scrypt(password: string | Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number): Uint8Array;
}

declare module "secrets.js-grempe" {
  const secrets: {
    share(secret: string, total: number, threshold: number): string[];
    combine(shares: string[]): string;
  };
  export default secrets;
}
