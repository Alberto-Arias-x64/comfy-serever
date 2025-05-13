import { COMFY_SERVER, COMFY_WORKFLOW, OUTPUT_PATH } from "./config.js";
import path from "path";

const STATUS = {
  "RUNNING": "RUNNING",
  "PENDING": "PENDING",
  "NOT_FOUND": "NOT_FOUND",
}

const randomizeSeed = () => Math.floor(Math.random() * 18446744073709551615) + 1;

const modifyWorkflow = (workflow, data) => {
  workflow["31"]["inputs"]["seed"] = data?.["seed"] ?? randomizeSeed();
  workflow["31"]["inputs"]["steps"] = data?.["steps"] ?? 28;
  workflow["6"]["inputs"]["text"] = data?.["prompt"] ?? "A simple tattoo of 'Hello, world!'";
  workflow["35"]["inputs"]["guidance"] = data?.["guidance"] ?? 3.6;
  workflow["63"]["inputs"]["width"] = data?.["width"] ?? 768;
  workflow["63"]["inputs"]["height"] = data?.["height"] ?? 768;
  workflow["63"]["inputs"]["batch_size"] = data?.["batch_size"] ?? 1;
  return workflow;
};

const makeRequest = async (prompt) => {
  const response = await fetch(`${COMFY_SERVER}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const { prompt_id } = await response.json();
  return prompt_id;
};

const consultQueue = async (id) => {
  const response = await fetch(`${COMFY_SERVER}/queue`)
  const queue = await response.json();
  const running = queue["queue_running"]
  const pending = queue["queue_pending"]
  if (running.find(item => item[1] === id)) return STATUS.RUNNING;
  if (pending.find(item => item[1] === id)) return STATUS.PENDING;
  return STATUS.NOT_FOUND;
}

const getResponse = async (id) => {
  const response = await fetch(`${COMFY_SERVER}/history/${id}`)
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

/**
 * @param {object} prompt
 * @param {Object} prompt.seed - Random seed for generation. If not provided, a random seed will be generated
 * @param {number} [prompt.steps] - Number of diffusion steps. Defaults to 28
 * @param {string} [prompt.prompt] - Text prompt for image generation. Defaults to a detailed tattoo description
 * @param {number} [prompt.guidance] - Guidance scale for the model. Defaults to 3.6
 * @param {number} [prompt.width] - Width of the output image in pixels. Defaults to 768
 * @param {number} [prompt.height] - Height of the output image in pixels. Defaults to 768
 * @param {number} [prompt.batch_size] - Number of images to generate in one batch. Defaults to 1
 * @returns {Promise<string[]>}
 * @description Creates a prediction with the given prompt and returns the output images
 */
export default async function CreatePrediction(prompt) {
  const prompt_id = await makeRequest(modifyWorkflow(COMFY_WORKFLOW, prompt));
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const queueStatus = await consultQueue(prompt_id);
    if (queueStatus === STATUS.RUNNING) continue;
    if (queueStatus === STATUS.PENDING) continue;
    break;
  }
  const res = processOutputs(await getResponse(prompt_id));
  if (res === null) return null;
  return res.map(file => path.join(OUTPUT_PATH, file));
}
