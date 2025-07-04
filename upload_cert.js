#!/usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const https = require("https");

const REGION = process.env.AWS_REGION || "us-west-2"; // Update this if needed
const BUCKET_NAME = process.env.S3_BUCKET_NAME; // Must be set in environment

if (!BUCKET_NAME) {
  console.error("❌ Error: S3_BUCKET_NAME environment variable not set.");
  process.exit(1);
}

const filename = process.argv[2];
if (!filename) {
  console.error("❌ Usage: node upload_cert.js <path-to-file>");
  process.exit(1);
}

const basename = path.basename(filename);
const s3 = new AWS.S3({ region: REGION });

(async () => {
  try {
    const fileContent = fs.readFileSync(filename);
    const contentType = "application/x-pem-file"; // Customize if needed

    const params = {
      Bucket: BUCKET_NAME,
      Key: basename,
      Expires: 300,
      ContentType: contentType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", params);
    console.log("🔗 Pre-signed URL generated");

    const req = https.request(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileContent.length,
      },
    });

    req.on("response", (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Upload successful!");
      } else {
        console.error(`❌ Upload failed with status ${res.statusCode}`);
      }
    });

    req.on("error", (err) => {
      console.error("❌ Request error:", err);
    });

    req.write(fileContent);
    req.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
