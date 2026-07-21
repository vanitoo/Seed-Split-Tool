import * as base64 from "base64-js";
import { Buffer } from "buffer";
import scrypt from "scryptsy";
import nacl from "tweetnacl";

type BananaPayload = { v: 1; t: string; r: number; d: string; n: string };

function hexify(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function dehexify(value: string): Uint8Array {
  if (value.length % 2 !== 0 || !/^[0-9a-f]*$/iu.test(value)) throw new Error("Некорректные данные Banana Split");
  const result = new Uint8Array(value.length / 2);
  for (let index = 0; index < result.length; index += 1) result[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return result;
}

function decodeBase64(value: string, field: string): Uint8Array {
  if (!value || !/^[A-Za-z0-9+/]+={0,2}$/u.test(value)) throw new Error(`Повреждено поле ${field} Banana Split`);
  try {
    return base64.toByteArray(value);
  } catch {
    throw new Error(`Повреждено поле ${field} Banana Split`);
  }
}

function hashTitle(title: string): Uint8Array {
  return nacl.hash(new TextEncoder().encode(title));
}

function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  return new Uint8Array(scrypt(passphrase.normalize("NFKD"), Buffer.from(salt), 1 << 15, 8, 1, 32));
}

function parsePayload(part: string): BananaPayload {
  let value: unknown;
  try {
    value = JSON.parse(part);
  } catch {
    throw new Error("Часть Banana Split содержит некорректный JSON");
  }

  if (!value || typeof value !== "object") throw new Error("Поврежденный формат части Banana Split");
  const payload = value as Partial<BananaPayload>;
  if (
    payload.v !== 1 ||
    typeof payload.t !== "string" || payload.t.length === 0 || payload.t.length > 200 ||
    !Number.isInteger(payload.r) || (payload.r ?? 0) < 2 || (payload.r ?? 0) > 255 ||
    typeof payload.d !== "string" || payload.d.length < 2 ||
    typeof payload.n !== "string"
  ) {
    throw new Error("Поврежденный формат части Banana Split");
  }

  const nonce = decodeBase64(payload.n, "nonce");
  if (nonce.length !== nacl.secretbox.nonceLength) throw new Error("Некорректная длина nonce Banana Split");
  if (!/^[0-9A-Fa-f][A-Za-z0-9+/]+={0,2}$/u.test(payload.d)) throw new Error("Повреждены данные части Banana Split");
  decodeBase64(payload.d.slice(1), "data");
  return payload as BananaPayload;
}

export async function splitBanana(secret: string, title: string, passphrase: string, total: number, threshold: number): Promise<string[]> {
  if (!secret) throw new Error("Введите секрет");
  if (!passphrase) throw new Error("Для Banana Split нужен пароль");
  if (!Number.isInteger(total) || !Number.isInteger(threshold) || threshold < 2 || threshold > total || total > 255) {
    throw new Error("Некорректная схема Banana Split");
  }

  const normalizedTitle = title.trim() || "Seed Split Tool";
  const { default: secrets } = await import("secrets.js-grempe");
  const salt = hashTitle(normalizedTitle);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(new TextEncoder().encode(secret), nonce, deriveKey(passphrase, salt));
  const rawShares = secrets.share(hexify(encrypted), total, threshold);
  return rawShares.map((share) => {
    const encoded = share[0] + base64.fromByteArray(dehexify(share.slice(1)));
    return JSON.stringify({ v: 1, t: normalizedTitle, r: threshold, d: encoded, n: base64.fromByteArray(nonce) });
  });
}

export async function recoverBanana(parts: string[], passphrase: string): Promise<string> {
  if (!passphrase) throw new Error("Введите пароль Banana Split");
  const payloads = parts.filter((part) => part.trim()).map(parsePayload);
  const first = payloads[0];
  if (!first) throw new Error("Добавьте части Banana Split");
  if (payloads.length < first.r) throw new Error(`Нужно минимум ${first.r} частей Banana Split`);
  if (!payloads.every((item) => item.v === first.v && item.t === first.t && item.r === first.r && item.n === first.n)) {
    throw new Error("Части Banana Split относятся к разным наборам");
  }

  const { default: secrets } = await import("secrets.js-grempe");
  const rawShares = payloads.map((item) => item.d[0] + hexify(decodeBase64(item.d.slice(1), "data")));
  let encrypted: Uint8Array;
  try {
    encrypted = dehexify(secrets.combine(rawShares));
  } catch {
    throw new Error("Не удалось объединить части Banana Split");
  }

  const opened = nacl.secretbox.open(encrypted, decodeBase64(first.n, "nonce"), deriveKey(passphrase, hashTitle(first.t)));
  if (!opened) throw new Error("Неверный пароль или поврежденные части Banana Split");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(opened);
  } catch {
    throw new Error("Восстановленный секрет Banana Split не является корректным UTF-8 текстом");
  }
}
