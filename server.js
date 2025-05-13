import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __output = path.dirname('/home/flux/ComfyUI/output');

const serverAddress = '127.0.0.1:8188';

const STATUS = {
  "RUNNING": "RUNNING",
  "PENDING": "PENDING",
  "NOT_FOUND": "NOT_FOUND",
}

const loadWorkflow = async () => {
  const workflow = await fs.readFile(path.join(__dirname, 'DEV_COMPOSE_TATTOO.json'), 'utf8');
  return JSON.parse(workflow);
};

const randomizeSeed = () => Math.floor(Math.random() * 18446744073709551615) + 1;

const modifyWorkflow = (workflow, data) => {
  workflow["31"]["inputs"]["seed"] = data?.["seed"] ?? randomizeSeed();
  workflow["31"]["inputs"]["steps"] = data?.["steps"] ?? 28;
  workflow["6"]["inputs"]["text"] = data?.["prompt"] ?? "A highly detailed Brachial region (medial aspect) body part tattoo of Mechanical gears fused with human anatomy, is in color tattoo, use a realistic colors ,  on female woman body. in Keith Haring style, featuring bold black outlines and solid color fills, figures posed in dynamic and playful dance movements, minimalist design —strictly no nudity or exposed body parts—";
  workflow["35"]["inputs"]["guidance"] = data?.["guidance"] ?? 3.6;
  workflow["63"]["inputs"]["width"] = data?.["width"] ?? 768;
  workflow["63"]["inputs"]["height"] = data?.["height"] ?? 768;
  workflow["63"]["inputs"]["batch_size"] = data?.["batch_size"] ?? 1;
  return workflow;
};

const makeRequest = async (prompt) => {
  const response = await fetch(`http://${serverAddress}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const { prompt_id } = await response.json();
  return prompt_id;
};

const consultQueue = async (id) => {
  const response = await fetch(`http://${serverAddress}/queue`)
  const queue = await response.json();
  const running = queue["queue_running"]
  const pending = queue["queue_pending"]
  if (running.find(item => item[1] === id)) return STATUS.RUNNING;
  if (pending.find(item => item[1] === id)) return STATUS.PENDING;
  return STATUS.NOT_FOUND;
}

const getResponse = async (id) => {
  const response = await fetch(`http://${serverAddress}/history/${id}`)
  const status = await response.json();
  if (status[id] === undefined) return null;
  return {
    status: status[id]["status"],
    outputs: status?.[id]?.["outputs"],
  }
};

const processOutputs = (data) => {
  if (data["status"] === "pending") return null;
  if (data["status"] === "executing") return null;
  if (data["status"] === "error") return null;
  if (data["status"] === "canceled") return null;
  if (data["outputs"] === undefined) return null;
  return data["outputs"]["9"]["images"].map(file => file["filename"]);
}

const prompt_id = await makeRequest(modifyWorkflow(await loadWorkflow()));

while (true) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const queueStatus = await consultQueue(prompt_id);
  if (queueStatus === STATUS.RUNNING) continue;
  if (queueStatus === STATUS.PENDING) continue;
  break;
}

const res = processOutputs(await getResponse(prompt_id));
if (res === null) exit(1);
const buffer = await fs.readFile(path.join(__output, res[0]));
const base64 = buffer.toString('base64');
console.log(base64);
