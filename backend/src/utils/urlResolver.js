import https from "https";
import http from "http";

/**
 * Resolves short links (like maps.app.goo.gl, goo.gl, etc.) into full Google Maps destination URLs.
 * Uses Google DNS-over-HTTPS fallback to bypass local ISP DNS timeouts on maps.app.goo.gl.
 */
export async function resolveGoogleMapsUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== "string") return inputUrl;
  const trimmed = inputUrl.trim();

  try {
    const urlObj = new URL(trimmed);

    // If it's already a full google.com maps or search link, no unshortening needed
    if (
      urlObj.hostname.includes("google.com") &&
      !urlObj.hostname.includes("goo.gl")
    ) {
      return trimmed;
    }

    // Only unshorten short domains like maps.app.goo.gl, goo.gl, etc.
    if (!urlObj.hostname.includes("goo.gl") && !urlObj.hostname.includes("bit.ly")) {
      return trimmed;
    }

    // 1. Fetch Google's real IP for the short domain via Google DNS-over-HTTPS (DoH)
    let targetIp = null;
    try {
      const dohRes = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(urlObj.hostname)}&type=A`,
        { signal: AbortSignal.timeout(2500) }
      );
      const dohData = await dohRes.json();
      if (dohData?.Answer && dohData.Answer.length > 0) {
        targetIp = dohData.Answer[0].data;
      }
    } catch {
      targetIp = null;
    }

    // 2. Perform HTTP GET request to resolve 302 location header
    return await new Promise((resolve) => {
      const requestOptions = {
        hostname: targetIp || urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: {
          Host: urlObj.hostname,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        servername: urlObj.hostname,
        timeout: 3500,
      };

      const client = urlObj.protocol === "https:" ? https : http;
      const req = client.request(requestOptions, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          let resolvedLocation = res.headers.location;
          // If relative redirect, make absolute
          if (resolvedLocation.startsWith("/")) {
            resolvedLocation = `${urlObj.protocol}//${urlObj.hostname}${resolvedLocation}`;
          }
          return resolve(resolvedLocation);
        }
        return resolve(trimmed);
      });

      req.on("error", () => resolve(trimmed));
      req.on("timeout", () => {
        req.destroy();
        resolve(trimmed);
      });
      req.end();
    });
  } catch (error) {
    console.warn("Failed to unshorten Google Maps link, using original:", error.message);
    return trimmed;
  }
}
