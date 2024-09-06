// src/aws-config.js
import AWS from "aws-sdk";

const S3_BUCKET = "avverma";
const REGION = "ap-south-1";

AWS.config.update({
  accessKeyId: "AKIARRSTFGSV74HCL27W",
  secretAccessKey: "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",
});

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

export default myBucket;
