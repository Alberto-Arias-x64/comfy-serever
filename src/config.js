import { fileURLToPath } from "url";
import fs from "fs/promises";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __output = path.dirname("/home/flux/ComfyUI/output");
const __config = path.join(__dirname, "..", "config");
const __utils = path.join(__dirname, "..", "utils");
const __logs = path.join(__dirname, "..", "logs");

export const CLOUDFLARE_SERVICE = JSON.parse(await fs.readFile(path.join(__config, "cloudflare-service.json"), "utf-8"));
export const FIREBASE_SERVICE = JSON.parse(await fs.readFile(path.join(__config, "firebase-service.json"), "utf-8"));
export const COMFY_WORKFLOW = JSON.parse(await fs.readFile(path.join(__utils, "workflow.json"), "utf-8"));

export const PUBLIC_URL = "https://pub-ba0b205fe24a43d293ad87e63f55576f.r2.dev";
export const COMFY_SERVER = "http://127.0.0.1:8188";
export const BUCKET_NAME = "tattoo-ia";
export const OUTPUT_PATH = __output;
export const LOG_PATH = __logs;

export const POLLING_TIME = 1000;
