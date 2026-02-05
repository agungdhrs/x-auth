// Usage: node scripts/test-twitter.mjs <access_token>
// Note: This script uses Twitter API v2 with OAuth 2.0 Bearer Token.

const accessToken = process.argv[2];

if (!accessToken) {
  console.error("Usage: node scripts/test-twitter.mjs <access_token>");
  console.error("Get the access token from your Supabase 'twitter_accounts' table or Auth logs.");
  process.exit(1);
}

const endpoint = 'https://api.twitter.com/2/tweets';
const method = 'POST';

const requestData = {
  text: "Hello from Supabase + Next.js (OAuth 2.0)! 🚀"
};

console.log("Making request to X API...");

async function main() {
  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const json = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(json, null, 2));

  } catch (e) {
    console.error("Error:", e);
  }
}

main();
