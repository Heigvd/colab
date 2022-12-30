/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as API from 'colab-rest-client';

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  let currentByte = 0;
  for (let currentHexChar = 0; currentHexChar < hex.length; currentHexChar += 2) {
    bytes[currentByte] = Number.parseInt(hex.substring(currentHexChar, currentHexChar + 2), 16);
    currentByte++;
  }
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPBKDF2(
  salt: string,
  password: string,
  hash: AlgorithmIdentifier,
  iterations: number,
  length: number,
): Promise<string> {
  const pwKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const uint8Salt = hexToUint8Array(salt);

  const params: Pbkdf2Params = {
    name: 'PBKDF2',
    hash: hash,
    salt: uint8Salt,
    iterations: iterations,
  };

  const keyBuffer = await crypto.subtle.deriveBits(params, pwKey, length);

  return bytesToHex(keyBuffer);
}

export async function hashPassword(
  method: API.AuthMethod['mandatoryMethod'],
  salt: string,
  password: string,
): Promise<string> {
  switch (method) {
    case 'PBKDF2WithHmacSHA512_65536_64':
      return hashPBKDF2(salt, password, 'SHA-512', 65536, 64 * 8);
  }
}
