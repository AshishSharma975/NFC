async function simulateFrontendUserJourney() {
  const backendBase = "http://localhost:5000";
  console.log("🚀 Starting Full Frontend-to-Backend Simulation...\n");

  // Step 1: User fills out Activate page
  const userCardId = "TD-PROD-99";
  const originalGoogleReview = "https://g.page/r/original-business-review-link";
  console.log(`1. Simulating Form Submit on /activate:`);
  console.log(`   Card ID: ${userCardId}`);
  console.log(`   Destination: ${originalGoogleReview}`);

  const activateResponse = await fetch(`${backendBase}/api/cards/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardId: userCardId,
      destinationUrl: originalGoogleReview,
    }),
  });

  const activateResult = await activateResponse.json();
  console.log("   Response:", activateResult);
  if (!activateResult.success) throw new Error("Activation failed");

  const permanentQrLink = activateResult.data.qrUrl;
  console.log(`\n2. Permanent QR Link Encoded in QR Code: ${permanentQrLink}`);

  // Step 2: Customer taps NFC card or scans QR code
  console.log(`\n3. Simulating Customer NFC Tap / QR Scan on ${permanentQrLink}...`);
  const scan1 = await fetch(permanentQrLink, { redirect: "manual" });
  console.log(`   HTTP Status: ${scan1.status} (302 Found)`);
  console.log(`   Redirecting Customer To: ${scan1.headers.get("location")}`);
  if (scan1.headers.get("location") !== originalGoogleReview) {
    throw new Error("Scan 1 did not redirect to original link");
  }

  // Step 3: Owner edits destination link from Result page
  const updatedGoogleReview = "https://g.page/r/UPDATED-NEW-GOOGLE-REVIEW-LINK";
  console.log(`\n4. Simulating Owner Clicking 'Edit link' on Result Page:`);
  console.log(`   Updating Card '${userCardId}' to: ${updatedGoogleReview}`);

  const updateResponse = await fetch(`${backendBase}/api/cards/${userCardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destinationUrl: updatedGoogleReview,
    }),
  });

  const updateResult = await updateResponse.json();
  // update response
  console.log("   Update Response:", updateResult);
  if (!updateResult.success) throw new Error("Update failed");

  // Step 4: Verify permanent link did NOT change
  console.log(`\n5. Verifying Permanent QR Link Remains Exactly Same:`);
  console.log(`   Original QR Link: ${permanentQrLink}`);
  console.log(`   After Update QR Link: ${updateResult.data.qrUrl}`);
  if (permanentQrLink !== updateResult.data.qrUrl) {
    throw new Error("Permanent QR Link changed! It must stay identical.");
  }
  console.log("   ✅ QR Link is 100% IDENTICAL!");

  // Step 5: Customer scans the SAME physical QR code again
  console.log(`\n6. Customer Scans the SAME Physical QR Code Again...`);
  const scan2 = await fetch(permanentQrLink, { redirect: "manual" });
  console.log(`   HTTP Status: ${scan2.status} (302 Found)`);
  console.log(`   Customer is NOW dynamically redirected to: ${scan2.headers.get("location")}`);
  if (scan2.headers.get("location") !== updatedGoogleReview) {
    throw new Error("Scan 2 did not redirect to updated link");
  }
  console.log("   ✅ DYNAMIC REDIRECTION CONFIRMED! Target URL updated dynamically without changing physical QR!");

  // Step 6: Verify scan count
  const cardDetails = await fetch(`${backendBase}/api/cards/${userCardId}`).then((r) => r.json());
  console.log(`\n7. Card Scan Statistics in MongoDB:`);
  console.log(`   Total Scans Tracked: ${cardDetails.data.scanCount}`);
  console.log(`   Last Scanned At: ${cardDetails.data.lastScannedAt}`);
  if (cardDetails.data.scanCount < 2) {
    throw new Error("Scan count was not incremented properly");
  }

  console.log("\n🎉 ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!\n");
}

simulateFrontendUserJourney();
