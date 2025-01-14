const { encrypt, decrypt } = require("../encryption");

// Decrypt middleware (for incoming requests)
function decryptRequest(req, res, next) {
  if (req.body && req.body.encryptedData) {
    try {
      const { encryptedData, iv } = req.body.encryptedData;
      const decrypted = decrypt(encryptedData, iv);
      req.body = JSON.parse(decrypted); // Parse and set the decrypted body
      next();
    } catch (err) {
      return res.status(400).json({ error: "Decryption failed" });
    }
  } else {
    next();
  }
}

// Encrypt middleware (for outgoing responses)
function encryptResponse(req, res, next) {
  const originalSend = res.send;

  res.send = function (data) {
    if (data && typeof data === "object") {
      try {
        const encrypted = encrypt(JSON.stringify(data));
        data = { encryptedData: encrypted };
      } catch (err) {
        return res.status(500).json({ error: "Encryption failed" });
      }
    }

    originalSend.call(this, data);
  };

  next();
}

module.exports = { decryptRequest, encryptResponse };
