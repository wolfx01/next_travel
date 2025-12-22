const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API KEY found in .env.local");
    return;
  }
  console.log("API Key found (starts with):", apiKey.substring(0, 5));

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

  for (const modelName of modelsToTry) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      console.log(`SUCCESS with ${modelName}:`, response.text());
    } catch (error) {
      console.error(`FAILED with ${modelName}:`, error.message);
      if (error.response) {
          console.error("Error details:", JSON.stringify(error.response, null, 2));
      }
    }
  }
}

main();
