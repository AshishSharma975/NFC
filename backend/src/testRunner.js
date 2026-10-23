async function runTests() {
  const baseUrl = "http://localhost:5000";
  console.log("🧪 Starting API & Dynamic QR Redirect Verification...\n");

  try {
    // 1. Health check
    console.log("1. Testing Health Check (GET /health)...");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log("   Health Status:", healthRes.status, healthData);
    if (healthRes.status !== 200 || healthData.status !== "ok") {
      throw new Error("Health check failed!");
    }

    // 2. Activate a test card
    const testCardId = "TEST-TD001";
    const initialUrl = "https://g.page/r/sample-google-review-initial";
    console.log(`\n2. Testing Card Activation (POST /api/cards/activate) for ${testCardId}...`);
    const activateRes = await fetch(`${baseUrl}/api/cards/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: testCardId,
        destinationUrl: initialUrl,
        title: "Test Business Store",
      }),
    });
    const activateData = await activateRes.json();
    console.log("   Activate Status:", activateRes.status, activateData);
    if (!activateData.success || !activateData.data.qrUrl) {
      throw new Error("Card activation failed!");
    }
    console.log("   Generated Permanent QR URL:", activateData.data.qrUrl);

    // 3. Test Scan Redirect to initial URL (GET /c/TEST-TD001)
    console.log(`\n3. Testing Scan Redirect for initial URL (GET /c/${testCardId})...`);
    // Use manual redirect: "manual" so we can inspect the 302 Location header
    const redirectRes1 = await fetch(`${baseUrl}/c/${testCardId}`, {
      redirect: "manual",
    });
    console.log("   Redirect HTTP Status:", redirectRes1.status);
    const location1 = redirectRes1.headers.get("location");
    console.log("   Redirect Location Header:", location1);
    if (redirectRes1.status !== 302 || location1 !== initialUrl) {
      throw new Error(`Expected redirect to ${initialUrl}, but got ${location1}`);
    }
    console.log("   ✅ Initial scan redirected correctly to Google Review URL!");

    // 4. Update Destination URL for the same card (PUT /api/cards/TEST-TD001)
    const updatedUrl = "https://g.page/r/sample-google-review-NEW-UPDATED-LINK";
    console.log(`\n4. Testing Update Destination URL (PUT /api/cards/${testCardId})...`);
    const updateRes = await fetch(`${baseUrl}/api/cards/${testCardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationUrl: updatedUrl,
      }),
    });
    const updateData = await updateRes.json();
    console.log("   Update Status:", updateRes.status, updateData);
    if (!updateData.success || updateData.data.destinationUrl !== updatedUrl) {
      throw new Error("Update failed!");
    }

    // 5. Verify that the SAME permanent QR URL now redirects to the NEW URL!
    console.log(`\n5. Verifying dynamic redirect to updated URL (GET /c/${testCardId})...`);
    const redirectRes2 = await fetch(`${baseUrl}/c/${testCardId}`, {
      redirect: "manual",
    });
    console.log("   Redirect HTTP Status:", redirectRes2.status);
    const location2 = redirectRes2.headers.get("location");
    console.log("   New Redirect Location Header:", location2);
    if (redirectRes2.status !== 302 || location2 !== updatedUrl) {
      throw new Error(`Expected redirect to ${updatedUrl}, but got ${location2}`);
    }
    console.log("   ✅ DYNAMIC REDIRECT VERIFIED! QR URL remained constant (/c/TEST-TD001) while destination changed!");

    // 6. Test Unknown Card Redirect (GET /c/UNKNOWN-999)
    console.log("\n6. Testing Unknown Card Scan (GET /c/UNKNOWN-999)...");
    const unknownRes = await fetch(`${baseUrl}/c/UNKNOWN-999`);
    console.log("   Unknown Card Status:", unknownRes.status);
    const unknownHtml = await unknownRes.text();
    if (unknownRes.status !== 404 || !unknownHtml.includes("Card Not Activated")) {
      throw new Error("Expected 404 HTML status page for unknown card");
    }
    console.log("   ✅ Unknown card returns friendly 404 HTML status page!");

    // 7. Test Inactivating Card (PUT /api/cards/TEST-TD001 -> status: 'inactive')
    console.log(`\n7. Testing Inactive Card Handling...`);
    await fetch(`${baseUrl}/api/cards/${testCardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inactive" }),
    });
    const inactiveRes = await fetch(`${baseUrl}/c/${testCardId}`);
    console.log("   Inactive Scan Status:", inactiveRes.status);
    const inactiveHtml = await inactiveRes.text();
    if (inactiveRes.status !== 403 || !inactiveHtml.includes("Card Is Currently Disabled")) {
      throw new Error("Expected 403 HTML page for inactive card");
    }
    console.log("   ✅ Inactive card returns friendly 403 HTML status page!");

    // Re-activate test card for clean state
    await fetch(`${baseUrl}/api/cards/${testCardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% WORKING!\n");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();
