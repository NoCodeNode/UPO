// shared/crypto.js — Simple XOR cipher for API key obfuscation at rest

/**
 * Generates a deterministic salt based on the extension ID
 * @returns {string} Salt string
 */
function getSalt() {
  // Use extension ID as part of the salt for device-specific obfuscation
  const extensionId = chrome.runtime.id || 'upo-default-salt';
  return extensionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
}

/**
 * XOR cipher for simple obfuscation (NOT cryptographically secure, just obscures plain text)
 * @param {string} text - Text to encode/decode
 * @param {string} key - Key for XOR operation
 * @returns {string} Obfuscated/deobfuscated text
 */
function xorCipher(text, key) {
  if (!text) return '';
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    // XOR each character with the key character (cycling through key)
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Obfuscates an API key for storage
 * @param {string} apiKey - Plain text API key
 * @returns {string} Obfuscated key (base64 encoded)
 */
export function obfuscateKey(apiKey) {
  if (!apiKey) return '';
  
  const salt = getSalt();
  const obfuscated = xorCipher(apiKey, salt);
  
  // Convert to base64 for safe storage
  return btoa(obfuscated);
}

/**
 * Deobfuscates an API key from storage
 * @param {string} obfuscatedKey - Obfuscated key (base64 encoded)
 * @returns {string} Plain text API key
 */
export function deobfuscateKey(obfuscatedKey) {
  if (!obfuscatedKey) return '';
  
  try {
    const salt = getSalt();
    const obfuscated = atob(obfuscatedKey);
    
    // XOR is symmetric, so same operation decodes
    return xorCipher(obfuscated, salt);
  } catch (err) {
    console.error('Failed to deobfuscate key:', err);
    return '';
  }
}

/**
 * Securely clears a key from memory (best effort - limited effectiveness in JavaScript)
 * Note: JavaScript strings are immutable, so this provides minimal actual security benefit.
 * Included for defense-in-depth but should not be relied upon for complete memory clearing.
 * @param {string} key - Key to clear
 */
export function clearKeyFromMemory(key) {
  if (!key) return;
  
  // Attempt to overwrite the string in memory (limited effectiveness in JS due to immutability)
  try {
    // This will fail silently as strings are readonly - kept for best-effort approach
    // eslint-disable-next-line no-param-reassign
    key = '0'.repeat(key.length);
  } catch {
    // Readonly string, nothing we can do - this is expected
  }
}
