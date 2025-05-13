import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverAddress = '127.0.0.1:8188';

const loadWorkflow = async () => {
  const workflow = await fs.readFile(path.join(__dirname, 'workflows', 'DEV_COMPOSE_TATTOO.json'), 'utf8');
  return JSON.parse(workflow);
};

const randomizeSeed = () => Math.floor(Math.random() * 18446744073709551614n) + 1;

const modifyWorkflow = async (workflow) => {
  workflow["31"]["inputs"]["seed"] = randomizeSeed();
  workflow["31"]["inputs"]["steps"] = 28;
  workflow["6"]["inputs"]["text"] = "A highly detailed Brachial region (medial aspect) body part tattoo of Mechanical gears fused with human anatomy, is in color tattoo, use a realistic colors ,  on female woman body. in Keith Haring style, featuring bold black outlines and solid color fills, figures posed in dynamic and playful dance movements, minimalist design —strictly no nudity or exposed body parts—";
  workflow["35"]["inputs"]["guidance"] = 3.6;
  workflow["63"]["inputs"]["width"] = 768;
  workflow["63"]["inputs"]["height"] = 768;
  workflow["63"]["inputs"]["batch_size"] = 1;
  return workflow;
};

const makeRequest = async () => {
  const response = await fetch(`http://${serverAddress}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(modifyWorkflow(await loadWorkflow())),
  });
  return await response.json();
};

makeRequest().then(console.log);
