export type ShareEnvelope = {
  v: 1;
  id: string;
  x: number;
  threshold: number;
  total: number;
  checksum: string;
  data: string;
};

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let tablesReady = false;

function initTables(): void {
  if (tablesReady) return;
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
  tablesReady = true;
}

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  initTables();
  return EXP[LOG[a] + LOG[b]];
}

function div(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  if (a === 0) return 0;
  initTables();
  return EXP[(LOG[a] - LOG[b] + 255) % 255];
}

function randomByte(): number {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0];
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeEnvelope(envelope: ShareEnvelope): string {
  const json = JSON.stringify(envelope);
  return `SST1-${bytesToBase64Url(new TextEncoder().encode(json))}`;
}

export function decodeShare(value: string): ShareEnvelope {
  const normalized = value.trim();
  if (!normalized.startsWith("SST1-")) throw new Error("Это не часть Seed Split Tool v1");
  const decoded = new TextDecoder().decode(base64UrlToBytes(normalized.slice(5)));
  const valueObject = JSON.parse(decoded) as Partial<ShareEnvelope>;
  if (
    valueObject.v !== 1 ||
    typeof valueObject.id !== "string" ||
    typeof valueObject.x !== "number" ||
    typeof valueObject.threshold !== "number" ||
    typeof valueObject.total !== "number" ||
    typeof valueObject.checksum !== "string" ||
    typeof valueObject.data !== "string"
  ) throw new Error("Повреждённый формат части");
  return valueObject as ShareEnvelope;
}

async function checksum(bytes: Uint8Array): Promise<string> {
  const digestInput = Uint8Array.from(bytes);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", digestInput.buffer));
  return Array.from(digest.slice(0, 6), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function setId(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function splitSecret(secret: string, total: number, threshold: number): Promise<string[]> {
  if (!secret) throw new Error("Введите секрет");
  if (threshold < 2 || threshold > total) throw new Error("Порог должен быть от 2 до количества частей");
  if (total > 16) throw new Error("Максимум 16 частей");

  const input = new TextEncoder().encode(secret.normalize("NFKD"));
  const id = setId();
  const digest = await checksum(input);
  const shareData = Array.from({ length: total }, () => new Uint8Array(input.length));

  for (let byteIndex = 0; byteIndex < input.length; byteIndex += 1) {
    const coefficients = new Uint8Array(threshold);
    coefficients[0] = input[byteIndex];
    for (let degree = 1; degree < threshold; degree += 1) coefficients[degree] = randomByte();

    for (let shareIndex = 0; shareIndex < total; shareIndex += 1) {
      const x = shareIndex + 1;
      let y = coefficients[threshold - 1];
      for (let degree = threshold - 2; degree >= 0; degree -= 1) y = mul(y, x) ^ coefficients[degree];
      shareData[shareIndex][byteIndex] = y;
    }
  }

  return shareData.map((data, index) => encodeEnvelope({
    v: 1,
    id,
    x: index + 1,
    threshold,
    total,
    checksum: digest,
    data: bytesToBase64Url(data),
  }));
}

export async function recoverSecret(rawShares: string[]): Promise<string> {
  const unique = new Map<number, ShareEnvelope>();
  for (const raw of rawShares.filter((item) => item.trim())) {
    const share = decodeShare(raw);
    unique.set(share.x, share);
  }
  const shares = Array.from(unique.values());
  if (shares.length === 0) throw new Error("Добавьте части");
  const reference = shares[0];
  if (shares.some((share) => share.id !== reference.id)) throw new Error("Части относятся к разным наборам");
  if (shares.some((share) => share.threshold !== reference.threshold || share.total !== reference.total)) throw new Error("Параметры частей не совпадают");
  if (shares.length < reference.threshold) throw new Error(`Нужно ещё ${reference.threshold - shares.length} част.`);

  const selected = shares.slice(0, reference.threshold);
  const byteArrays = selected.map((share) => base64UrlToBytes(share.data));
  const length = byteArrays[0].length;
  if (byteArrays.some((bytes) => bytes.length !== length)) throw new Error("Размеры частей не совпадают");
  const output = new Uint8Array(length);

  for (let byteIndex = 0; byteIndex < length; byteIndex += 1) {
    let value = 0;
    for (let i = 0; i < selected.length; i += 1) {
      let basis = 1;
      for (let j = 0; j < selected.length; j += 1) {
        if (i === j) continue;
        basis = mul(basis, div(selected[j].x, selected[j].x ^ selected[i].x));
      }
      value ^= mul(byteArrays[i][byteIndex], basis);
    }
    output[byteIndex] = value;
  }

  const digest = await checksum(output);
  if (digest !== reference.checksum) throw new Error("Контрольная сумма не совпала. Одна из частей повреждена");
  return new TextDecoder("utf-8", { fatal: true }).decode(output).normalize("NFC");
}
