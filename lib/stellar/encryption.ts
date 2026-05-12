/**
 * lib/stellar/encryption.ts
 *
 * AES-256-GCM encryption/decryption for Stellar secret keys.
 * Secret keys MUST be encrypted before storing in the database.
 *
 * Uses Node.js built-in crypto module — no external dependencies.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // GCM standard IV length
const TAG_LENGTH = 16  // GCM authentication tag length

/**
 * Get the 32-byte encryption key from environment variables.
 * The key should be a 64-character hex string in .env.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate with: openssl rand -hex 32'
    )
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a Stellar secret key for safe database storage.
 * Returns a base64-encoded string: IV + ciphertext + auth tag.
 */
export function encryptSecretKey(secretKey: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(secretKey, 'utf8'),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  // Pack IV + ciphertext + auth tag into one base64 string
  const combined = Buffer.concat([iv, encrypted, tag])
  return combined.toString('base64')
}

/**
 * Decrypt a stored Stellar secret key.
 * Input should be the base64 string returned by encryptSecretKey().
 */
export function decryptSecretKey(encryptedData: string): string {
  const key = getEncryptionKey()
  const combined = Buffer.from(encryptedData, 'base64')

  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(combined.length - TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}
