const crypto = require("crypto-js");

// Secret key for AES encryption and decryption (ensure this is securely managed)
const secretKey = "your-secret-key"; // Ensure this is stored securely and not hardcoded in production

// List of routes to exclude from encryption
const excludedRoutes = ["/"]; // List of routes to exclude from encryption;

// Encrypt the payload using AES encryption
function encrypt(text) {
    //g for later decryption
    return crypto.AES.encrypt(JSON.stringify(text), secretKey).toString();
}

// Decrypt the payload using AES decryption
function decrypt(text) {
  // Extract IV from the first part of the encrypted data
    const bytes = crypto.AES.decrypt(text, secretKey);
    
  return bytes.toString(crypto.enc.Utf8);
}

// Middleware to decrypt incoming requests
function decryptRequest(req, res, next) {
  if (shouldSkipEncryption(req)) {
    return next(); // Skip decryption if the route is excluded
  }

  if (req.body.data) {
    try {
      req.body= JSON.parse(decrypt(req.body.data)); // Decrypt the payload data
      next();
    } catch (error) {
      return res.status(400).send("Invalid encrypted data");
    }
  } else {
    next();
  }
}

// Check if the current route should skip encryption or decryption
function shouldSkipEncryption(req) {
    //console.log(req.url);
  return excludedRoutes.includes(req.url);
}

// Middleware to decrypt incoming requests


// Middleware to encrypt outgoing responses
function encryptResponse(req, res, next) {
  const oldSend = res.json;
  res.json = function (body) {
    if (shouldSkipEncryption(req)) {
      return oldSend.call(this, body); // Skip encryption if the route is excluded
    }

      if (body) {
       //   console.log("this is encrypton");
      body = encrypt(body); // Encrypt the response body
    }
    oldSend.call(this, body); // Send the encrypted response
  };
  next();
}

module.exports = { decryptRequest, encryptResponse };
