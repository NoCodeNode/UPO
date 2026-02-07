// Test crypto module independently
const TEST_API_KEY = "csk-2d3xhh8rnn9ekc5pekmwwfm3fev5w4wwncpmd422dj6c53wt";

// Mock chrome.runtime for testing
global.chrome = {
  runtime: {
    id: 'test-extension-id-12345'
  }
};

// Simple XOR cipher implementation (matches crypto.js)
function getSalt() {
  const extensionId = global.chrome.runtime.id || 'upo-default-salt';
  return extensionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
}

function xorCipher(text, key) {
  if (!text) return '';
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

function obfuscateKey(apiKey) {
  if (!apiKey) return '';
  
  const salt = getSalt();
  const obfuscated = xorCipher(apiKey, salt);
  
  return Buffer.from(obfuscated, 'binary').toString('base64');
}

function deobfuscateKey(obfuscatedKey) {
  if (!obfuscatedKey) return '';
  
  try {
    const salt = getSalt();
    const obfuscated = Buffer.from(obfuscatedKey, 'base64').toString('binary');
    
    return xorCipher(obfuscated, salt);
  } catch (err) {
    console.error('Failed to deobfuscate key:', err);
    return '';
  }
}

// Test
console.log("Testing Crypto Module...\n");
console.log("Original API Key:", TEST_API_KEY);

const obfuscated = obfuscateKey(TEST_API_KEY);
console.log("Obfuscated:", obfuscated);
console.log("Obfuscated length:", obfuscated.length);

const deobfuscated = deobfuscateKey(obfuscated);
console.log("Deobfuscated:", deobfuscated);

if (deobfuscated === TEST_API_KEY) {
  console.log("\n✓ SUCCESS: Crypto module works correctly!");
} else {
  console.log("\n✗ FAILURE: Keys don't match!");
  console.log("Expected:", TEST_API_KEY);
  console.log("Got:     ", deobfuscated);
}
