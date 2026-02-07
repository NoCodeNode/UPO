/**
 * UPO Extension - Auto-Configuration Script
 * Run this in the extension's service worker console to automatically configure Cerebras
 */

const CEREBRAS_API_KEY = "csk-2d3xhh8rnn9ekc5pekmwwfm3fev5w4wwncpmd422dj6c53wt";

async function autoConfigureCerebras() {
  console.log("=== UPO AUTO-CONFIGURATION ===\n");
  
  try {
    // Step 1: Import crypto module
    console.log("Step 1: Importing crypto module...");
    const { obfuscateKey } = await import('./shared/crypto.js');
    console.log("✓ Crypto module imported");
    
    // Step 2: Obfuscate API key
    console.log("\nStep 2: Obfuscating API key...");
    const obfuscatedKey = obfuscateKey(CEREBRAS_API_KEY);
    console.log("✓ API key obfuscated");
    console.log(`  Obfuscated length: ${obfuscatedKey.length} characters`);
    
    // Step 3: Set provider
    console.log("\nStep 3: Setting provider to Cerebras...");
    await chrome.storage.local.set({ selectedProvider: 'cerebras' });
    console.log("✓ Provider set to 'cerebras'");
    
    // Step 4: Set Cerebras configuration
    console.log("\nStep 4: Saving Cerebras configuration...");
    await chrome.storage.local.set({
      cerebrasApiKey: obfuscatedKey,
      cerebrasModel: 'zai-glm-4.7',
      cerebrasTemperature: 1,      // Match official example
      cerebrasTopP: 0.95,           // Match official example
      cerebrasMaxTokens: 65000,
      cerebrasStream: false // Start with non-streaming for simplicity
    });
    console.log("✓ Cerebras configuration saved:");
    console.log("  - Model: zai-glm-4.7");
    console.log("  - Temperature: 1 (matches Cerebras official example)");
    console.log("  - Top-P: 0.95 (matches Cerebras official example)");
    console.log("  - Max Tokens: 65000");
    console.log("  - Streaming: disabled");
    
    // Step 5: Verify configuration
    console.log("\nStep 5: Verifying configuration...");
    const config = await chrome.storage.local.get([
      'selectedProvider',
      'cerebrasApiKey',
      'cerebrasModel',
      'cerebrasTemperature',
      'cerebrasTopP',
      'cerebrasMaxTokens',
      'cerebrasStream'
    ]);
    
    console.log("✓ Configuration verified:");
    console.log("  Provider:", config.selectedProvider);
    console.log("  Model:", config.cerebrasModel);
    console.log("  API Key:", config.cerebrasApiKey ? "Present (obfuscated)" : "MISSING!");
    
    if (!config.cerebrasApiKey) {
      throw new Error("API key not saved properly!");
    }
    
    console.log("\n✅ AUTO-CONFIGURATION COMPLETE!");
    console.log("\n📝 Next steps:");
    console.log("1. Go to any webpage");
    console.log("2. Select some text");
    console.log("3. Press Ctrl+Q");
    console.log("4. Watch your text get optimized!");
    
    return true;
    
  } catch (err) {
    console.error("\n❌ AUTO-CONFIGURATION FAILED!");
    console.error("Error:", err.message);
    console.error("\nPlease configure manually:");
    console.error("1. Click extension icon");
    console.error("2. Click 'Go to Settings'");
    console.error("3. Select 'Cerebras Cloud' from dropdown");
    console.error("4. Paste API key: " + CEREBRAS_API_KEY);
    console.error("5. Click 'Save Settings'");
    
    return false;
  }
}

// Auto-run
console.log("🚀 Starting auto-configuration...\n");
autoConfigureCerebras().then(success => {
  if (success) {
    console.log("\n✨ Ready to use! Extension is fully configured.");
  }
});
