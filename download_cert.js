const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bucket = process.env.S3_BUCKET_NAME;
const fileKey = process.argv[2];

if (!bucket) {
  console.error("❌ S3_BUCKET_NAME environment variable not set.");
  process.exit(1);
}

if (!fileKey) {
  console.error(
    "❌ You must provide the file name to download as an argument."
  );
  process.exit(1);
}

const outputPath = path.join(process.cwd(), `downloaded-${fileKey}`);

const params = {
  Bucket: bucket,
  Key: fileKey,
};

const file = fs.createWriteStream(outputPath);

s3.getObject(params)
  .createReadStream()
  .on("error", function (err) {
    console.error("❌ Error downloading file:", err.message);
    process.exit(1);
  })
  .pipe(file)
  .on("close", () => {
    console.log(`✅ File downloaded to: ${outputPath}`);
  });
