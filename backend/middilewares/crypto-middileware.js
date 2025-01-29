const crypto = require("crypto-js");

const secretKey = "your-secret-key"; 

const excludedRoutes = ["/"]; // List of routes to exclude from encryption;

function encrypt(text) {
    return crypto.AES.encrypt(JSON.stringify(text), secretKey).toString();
}

function decrypt(text) {
    const bytes = crypto.AES.decrypt(text, secretKey);
    
  return bytes.toString(crypto.enc.Utf8);
}

function decryptRequest(req, res, next) {
  if (shouldSkipEncryption(req)) {
    return next();
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

function shouldSkipEncryption(req) {
  return excludedRoutes.includes(req.url);
}


function encryptResponse(req, res, next) {
  const oldSend = res.json;
  res.json = function (body) {
    if (shouldSkipEncryption(req)) {
      return oldSend.call(this, body); 
    }

      if (body) {
      body = encrypt(body); 
    }
    oldSend.call(this, body); 
  };
  next();
}

module.exports = { decryptRequest, encryptResponse };
