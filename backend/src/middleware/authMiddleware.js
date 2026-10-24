export function requireApiKey(req, res, next) {
  const configuredKey = process.env.API_SECRET_KEY;

  // If no custom secret key is configured or left as default, allow
  if (!configuredKey || configuredKey === "nfc_secret_key_change_in_production") {
    return next();
  }

  // Extract from header x-api-key or Authorization Bearer
  const providedKey =
    req.headers["x-api-key"] ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : null);

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing API security key. Please provide a valid 'x-api-key' header.",
    });
  }

  next();
}
