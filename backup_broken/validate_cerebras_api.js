/**
 * Cerebras API Validation Script
 * Tests all three models with the official API format from Cerebras documentation
 */

const API_KEY = "csk-2d3xhh8rnn9ekc5pekmwwfm3fev5w4wwncpmd422dj6c53wt";
const ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";

// Test configurations matching official Cerebras curl examples
const TEST_CONFIGS = [
  {
    name: "Zai GLM 4.7B",
    model: "zai-glm-4.7",
    max_tokens: 65000,
    temperature: 1,
    top_p: 0.95
  },
  {
    name: "GPT-OSS 120B",
    model: "gpt-oss-120b",
    max_tokens: 32768,
    temperature: 1,
    top_p: 1
  },
  {
    name: "Qwen 3 235B Instruct",
    model: "qwen-3-235b-a22b-instruct-2507",
    max_tokens: 20000,
    temperature: 0.7,
    top_p: 0.8
  }
];

async function testModel(config) {
  console.log(`\n=== Testing ${config.name} ===`);
  console.log(`Model: ${config.model}`);
  console.log(`Max Tokens: ${config.max_tokens}`);
  console.log(`Temperature: ${config.temperature}`);
  console.log(`Top-P: ${config.top_p}`);
  
  const payload = {
    model: config.model,
    stream: false, // Use non-streaming for simpler testing
    max_tokens: config.max_tokens,
    temperature: config.temperature,
    top_p: config.top_p,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: "Say 'API test successful for " + config.model + "' if you can read this."
      }
    ]
  };
  
  console.log("\nRequest payload:");
  console.log(JSON.stringify(payload, null, 2));
  
  try {
    console.log("\nSending request...");
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    
    console.log("\n✅ Success!");
    console.log("Response:", data.choices[0].message.content);
    console.log("Token Usage:");
    console.log(`  - Prompt tokens: ${data.usage.prompt_tokens}`);
    console.log(`  - Completion tokens: ${data.usage.completion_tokens}`);
    console.log(`  - Total tokens: ${data.usage.total_tokens}`);
    
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║  Cerebras API Validation - All Models Test            ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  const results = [];
  
  for (const config of TEST_CONFIGS) {
    const result = await testModel(config);
    results.push({ model: config.name, ...result });
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n\n╔════════════════════════════════════════════════════════╗");
  console.log("║  Test Summary                                          ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  results.forEach(result => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} - ${result.model}`);
    if (!result.success) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  const allPassed = results.every(r => r.success);
  
  if (allPassed) {
    console.log("\n🎉 All models tested successfully!");
    console.log("✅ Cerebras API integration is working correctly");
    console.log("✅ Extension is ready to use");
  } else {
    console.log("\n⚠️ Some tests failed");
    console.log("Check the errors above for details");
  }
  
  return results;
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testModel, runAllTests, TEST_CONFIGS };
}

// Auto-run if in Node.js environment
if (typeof process !== 'undefined' && process.argv) {
  console.log("Starting Cerebras API validation...\n");
  runAllTests().catch(console.error);
}
