import { CLOUDFLARE_SERVICE, BUCKET_NAME, PUBLIC_URL } from "./config.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const r2 = new S3Client(CLOUDFLARE_SERVICE);

/**
 * @param {Buffer} data
 * @returns {Promise<string>}
 * @description Uploads an image to Cloudflare R2 and returns the public URL
 */
export const uploadImage = async (data) => {
  const key = `${randomUUID()}.png`;
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: data,
    ContentType: "image/png",
  }));

  return `${PUBLIC_URL}/${key}`;
};