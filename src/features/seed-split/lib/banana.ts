import * as base64 from "base64-js";
import { Buffer } from "buffer";
import scrypt from "scryptsy";
import secrets from "secrets.js-grempe";
import nacl from "tweetnacl";

type BananaPayload = { v?: number; t: string; r: number; d: string; n: string };

function hexify(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function dehexify(value: string): Uint8Array {
  if (value.length % 2 !== 0 || !/^[0-9a-f]*$/iu.test(value)) throw new Error("Некорректные данные Banana Split");
  const result = new Uint8Array(value.length / 2);
  for (let index = 0; index < result.length; index += 1) result[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return result;
}

function hashTitle(title: string): Uint8Array {
  return nacl.hash(new TextEncoder().encode(title));
}

function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  return new Uint8Array(scrypt(passphrase, Buffer.from(salt), 1 << 15, 8, 1, 32));
}

export function splitBanana(secret: string, title: string, passphrase: string, total: number, threshold: number): string[] {
  if (!passphrase) throw new Error("Для Banana Split нужен пароль");
  const salt = hashTitle(title);
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.secretbox(new TextEncoder().encode(secret), nonce, deriveKey(passphrase, salt));
  const rawShares = secrets.share(hexify(encrypted), total, threshold);
  return rawShares.map((share) => {
    const encoded = share[0] + base64.fromByteArray(dehexify(share.slice(1)));
    return JSON.stringify({ v: 1, t: title, r: threshold, d: encoded, n: base64.fromByteArray(nonce) });
  });
}

export function recoverBanana(parts: string[], passphrase: string): string {
  if (!passphrase) throw new Error("Введите пароль Banana Split");
  const payloads = parts.map((part) => JSON.parse(part) as BananaPayload);
  const first = payloads[0];
  if (!first) throw new Error("Добавьте части Banana Split");
  if (payloads.length < first.r) throw new Error(`Нужно минимум ${first.r} частей Banana Split`);
  if (!payloads.every((item) => (item.v ?? 0) === (first.v ?? 0) && item.t === first.t && item.r === first.r && item.n === first.n)) {
    throw new Error("Части Banana Split относятся к разным наборам");
  }
  if ((first.v ?? 0) !== 1) throw new Error("Поддерживается Banana Split v1");
  const rawShares = payloads.map((item) => item.d[0] + hexify(base64.toByteArray(item.d.slice(1))));
  const encrypted = dehexify(secrets.combine(rawShares));
  const opened = nacl.secretbox.open(encrypted, base64.toByteArray(first.n), deriveKey(passphrase, hashTitle(first.t)));
  if (!opened) throw new Error("Неверный пароль или повреждённые части Banana Split");
  return new TextDecoder("utf-8", { fatal: true }).decode(opened);
}
