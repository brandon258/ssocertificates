require("dotenv").config();
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const os = require("os");

const REGION = process.env.AWS_REGION || "us-west-2";
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  console.error("❌ Error: S3_BUCKET_NAME not set in environment");
  process.exit(1);
}

const filename = process.argv[2];
if (!filename) {
  console.error("❌ Usage: node download_cert.js <s3-object-key>");
  process.exit(1);
}

const s3 = new AWS.S3({ region: REGION });

(async () => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    const downloadsDir = path.join(os.homedir(), "Downloads");
    const outputPath = path.join(downloadsDir, filename);
    const file = fs.createWriteStream(outputPath);

    const stream = s3.getObject(params).createReadStream();
    stream.pipe(file);

    stream.on("end", () => {
      console.log(`✅ Download complete: ${outputPath}`);
    });

    stream.on("error", (err) => {
      console.error("❌ Download failed:", err.message);
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
