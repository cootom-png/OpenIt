import { readFileSync } from "fs";
import { storagePut } from "./server/storage";

async function main() {
  const buf = readFileSync("/home/ubuntu/test_video.mp4");
  const result = await storagePut("test/video-thumb-test.mp4", buf, "video/mp4");
  console.log("URL:", result.url);
}

main().catch(console.error);
