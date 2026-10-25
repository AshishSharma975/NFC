async function runTest() {
  const baseUrl = "http://localhost:5000";

  console.log("=== TEST 1: Admin Login ===");
  // Test wrong passcode
  const wrongLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong_password" }),
  });
  console.log("Wrong password status:", wrongLoginRes.status, "(expected 401)");
  if (wrongLoginRes.status !== 401) throw new Error("Expected 401 on wrong password");

  // Test correct passcode
  const correctLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "admin1234" }),
  });
  const loginJson = await correctLoginRes.json();
  console.log("Correct password response:", loginJson.success ? "SUCCESS" : "FAIL");
  if (!loginJson.success) throw new Error("Expected successful admin login");

  const adminToken = loginJson.token;

  console.log("\n=== TEST 2: Admin Stats ===");
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { "x-admin-key": adminToken },
  });
  const statsJson = await statsRes.json();
  console.log("Stats response:", statsJson.stats);

  console.log("\n=== TEST 3: Bulk Generate 5 Cards ===");
  const bulkRes = await fetch(`${baseUrl}/api/cards/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminToken,
    },
    body: JSON.stringify({
      count: 5,
      prefix: "TEST-",
      startNumber: 9001,
      status: "inactive",
      batchId: "TEST-BATCH-01",
    }),
  });
  const bulkJson = await bulkRes.json();
  console.log(`Generated ${bulkJson.count} cards. IDs:`, bulkJson.data.map(c => c.cardId));

  console.log("\n=== TEST 4: Customer Scans Unactivated Card ===");
  const scanUnactivated = await fetch(`${baseUrl}/c/TEST-09001`, { redirect: "manual" });
  const htmlUnactivated = await scanUnactivated.text();
  console.log("Scan unactivated HTTP status:", scanUnactivated.status);
  console.log("Contains 'Activate This Card' button?", htmlUnactivated.includes("Activate This Card"));
  if (!htmlUnactivated.includes("Activate This Card")) {
    throw new Error("Unactivated scan did not display activation page");
  }

  console.log("\n=== TEST 5: Customer Activates Card with Google Review Link ===");
  const testReviewUrl = "https://g.page/r/test-business-review";
  const activateRes = await fetch(`${baseUrl}/api/cards/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardId: "TEST-09001",
      destinationUrl: testReviewUrl,
      title: "Test Business Downtown",
    }),
  });
  const activateJson = await activateRes.json();
  console.log("Card activation result:", activateJson.success, "Status:", activateJson.data?.status);

  console.log("\n=== TEST 6: Customer Scans Activated Card ===");
  const scanActivated = await fetch(`${baseUrl}/c/TEST-09001`, { redirect: "manual" });
  console.log("Scan activated HTTP status:", scanActivated.status, "(expected 302)");
  console.log("Redirect Location:", scanActivated.headers.get("location"));
  if (scanActivated.headers.get("location") !== testReviewUrl) {
    throw new Error("Scan did not redirect to destination URL");
  }

  console.log("\n=== TEST 7: Clean Up Test Batch ===");
  const deleteRes = await fetch(`${baseUrl}/api/cards/bulk`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminToken,
    },
    body: JSON.stringify({ batchId: "TEST-BATCH-01" }),
  });
  const deleteJson = await deleteRes.json();
  console.log("Cleaned up cards:", deleteJson.deletedCount);

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
