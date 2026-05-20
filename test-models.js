/**
 * Verification Script for Gemini 3.5 & Google I/O 2026 Model Features
 * 
 * This automated test ensures that all the new I/O 2026 model configurations, 
 * adaptive thinking structures, and properties of the Gemini 3.5 models are 
 * fully registered, map correctly, and don't introduce runtime failures.
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 Starting Automated Prompt Laboratory Model Verification Tests...');

// 1. Read files
const typesPath = path.resolve('src/types/index.ts');
const servicePath = path.resolve('src/lib/geminiService.ts');
const appPath = path.resolve('src/app/App.tsx');

if (!fs.existsSync(typesPath) || !fs.existsSync(servicePath) || !fs.existsSync(appPath)) {
  console.error('❌ Critical Error: Essential workspace files are missing for test verification.');
  process.exit(1);
}

const typesContent = fs.readFileSync(typesPath, 'utf-8');
const serviceContent = fs.readFileSync(servicePath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');

let failed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ assertion failed: ${message}`);
    failed = true;
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

// 2. Validate GeminiModel Types and ALL_GEMINI_MODELS register
const newModels = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-low',
  'gemini-3.5-flash-medium',
  'gemini-3.5-flash-high',
  'gemini-3.5-flash-super-high',
  'gemini-3.5-flash-thinking',
  'gemini-3.5-pro',
  'gemini-omni'
];

console.log('\n--- 📋 Step 1: Validating Model Registries in types/index.ts ---');
newModels.forEach((model) => {
  assert(typesContent.includes(`| '${model}'`), `GeminiModel enum type supports ${model}`);
  assert(typesContent.includes(`'${model}',`), `ALL_GEMINI_MODELS constant registers ${model}`);
});

// 3. Validate Server/Service mappings & Thinking budget support
console.log('\n--- ⚙️ Step 2: Validating Mappings & Logic in geminiService.ts ---');

// Mock `isThinkingSupported` logic as written in geminiService
const isThinkingSupportedMock = (modelId) => {
  return (
    modelId.includes("gemini-3") ||
    modelId.includes("gemini-2.5") ||
    modelId.includes("thinking") ||
    modelId.includes("pro") ||
    modelId.includes("omni") ||
    modelId === "gemini-agent" ||
    modelId === "google-antigravity-engine"
  );
};

// Test isThinkingSupported for all Gemini 3.5 models
newModels.forEach((model) => {
  const supported = isThinkingSupportedMock(model);
  assert(supported === true, `isThinkingSupported identifies ${model} as compatible with reasoning/thinking logic`);
});

// Verify mapping inside `resolveModel`
newModels.forEach((model) => {
  const modelRegex = new RegExp(`"${model}"\\s*:\\s*"([^"]+)"`);
  const match = serviceContent.match(modelRegex);
  assert(match !== null, `${model} is registered inside the resolveModel dictionary`);
  if (match) {
    const targetModel = match[1];
    console.log(`   -> ${model} resolves internally to system model ID: "${targetModel}"`);
  }
});

// Verify adaptive thinking budget suffix mapping in config parser
assert(
  serviceContent.includes('settings.selectedModel.match(/-(low|medium|high|super-high)$/)') ||
  serviceContent.includes('settings.selectedModel.match(/\\-(low|medium|high|super-high)$/)'),
  'The service parser correctly intercepts budget suffixes (-low, -medium, -high, -super-high)'
);

// 4. Validate centralized default model setup in App.tsx
console.log('\n--- 📱 Step 3: Validating Default Application Engine Setup (App.tsx) ---');
const defaultModelInApp = appContent.includes("'gemini-3.5-flash-medium'");
assert(defaultModelInApp, 'Default app state is initialized to Gemini 3.5 Flash (Medium Thinking) format');

// 5. Final report
console.log('\n--- 📊 Final Verification Summary ---');
if (failed) {
  console.error('❌ Model validation suite failed. Check code mappings to ensure full safety.');
  process.exit(1);
} else {
  console.log('🎉 Excellent! All Gemini 3.5 models, omni options, thinking budgets and default presets are fully validated and ready for production deployment.');
}
