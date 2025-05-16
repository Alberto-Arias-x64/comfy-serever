import fs from "fs/promises";

const runpodApiKey = "";

const randomPrompt = () => {
  const prompts = [
    "Mechanical gears fused with human anatomy",
    "Anchor with nautical rope and compass",
    "Sun and moon intertwined, glowing",
    "Batman silhouette against a Gotham skyline",
    "Compass surrounded by ocean waves",
    "Scorpion with sharp, detailed claws",
    "Tiger with intense eyes in a jungle",
    "Spiral galaxy with stars and planets",
    "Angel wings with detailed feathers",
    "Samurai with a katana",
    "Futuristic cyberpunk girl with neon accents",
    "Athena, the goddess of war, fire",
    "Fierce Viking with intricate helmet design",
    "Majestic dragon coiled around a sword",
    "Howling wolf under a full moon",
    "Anchor entwined with roses and thorns",
    "Skull with roses and clock elements",
    "The Joker with a menacing smile",
    "Roaring lion with a flowing mane",
    "Butterfly with intricate wing patterns",
    "Simple triangle with a line through",
    "Rising phoenix with vibrant fiery wings",
    "Mountain range with a rising sun",
    "Hourglass with sand and skulls",
    "Tree of life with roots and branches"
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

const randomGender = () => {
  const genders = ["female woman", "male man"];
  return genders[Math.floor(Math.random() * genders.length)];
}

const randomBodyPart = () => {
  const bodyParts = ["back", "chest", "shoulder", "arm", "hand", "leg", "foot"];
  return bodyParts[Math.floor(Math.random() * bodyParts.length)];
}

const randomizeSeed = () => Math.floor(Math.random() * 18446744073709551615) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomPromptDev = "A highly detailed on back skin, back tattoo body part tattoo of The Joker with a menacing smile, is in color tattoo, use a realistic colors ,  on female woman body. highly detailed tattoo, highly detailed tattoo, highly detailed tattoo, highly detailed tattoo, coherent and cohesive tattoo design, hide the nipples, don't show nipples"

async function checkStatus(jobId) {
  const statusUrl = "https://api.runpod.ai/v2/8vm6zp69f1ivkz/status/" + jobId;
  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + runpodApiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`);
  }

  return await response.json();
}

async function waitForCompletion(jobId, maxRetries = 60, initialDelay = 1000) {
  let retries = 0;
  let currentDelay = initialDelay;

  while (retries < maxRetries) {
    const status = await checkStatus(jobId);

    if (status.status === "COMPLETED") {
      return status;
    }

    if (status.status === "FAILED") {
      throw new Error(`Job failed: ${JSON.stringify(status)}`);
    }

    if (status.status === "CANCELLED") {
      throw new Error("Job was cancelled");
    }

    await delay(currentDelay);
    currentDelay = Math.min(currentDelay * 1.5, 10000); // Exponential backoff, max 10 seconds
    retries++;
  }

  throw new Error("Max retries reached while waiting for job completion");
}

async function generateImage() {
  const url = "https://api.runpod.ai/v2/8vm6zp69f1ivkz/run";
  const bodyPart = randomBodyPart();
  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + runpodApiKey
    },
    body: JSON.stringify({
      "input": {
        "workflow": {
          "5": {
            "inputs": {
              "width": 1024,
              "height": 1024,
              "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
              "title": "Empty Latent Image"
            }
          },
          "6": {
            "inputs": {
              "text": randomPromptDev,
              "clip": ["11", 0]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
              "title": "CLIP Text Encode (Prompt)"
            }
          },
          "8": {
            "inputs": {
              "samples": ["13", 0],
              "vae": ["10", 0]
            },
            "class_type": "VAEDecode",
            "_meta": {
              "title": "VAE Decode"
            }
          },
          "9": {
            "inputs": {
              "filename_prefix": "ComfyUI",
              "images": ["8", 0]
            },
            "class_type": "SaveImage",
            "_meta": {
              "title": "Save Image"
            }
          },
          "10": {
            "inputs": {
              "vae_name": "ae.safetensors"
            },
            "class_type": "VAELoader",
            "_meta": {
              "title": "Load VAE"
            }
          },
          "11": {
            "inputs": {
              "clip_name1": "t5xxl_fp8_e4m3fn.safetensors",
              "clip_name2": "clip_l.safetensors",
              "type": "flux"
            },
            "class_type": "DualCLIPLoader",
            "_meta": {
              "title": "DualCLIPLoader"
            }
          },
          "12": {
            "inputs": {
              "unet_name": "flux1-dev.safetensors",
              "weight_dtype": "fp8_e4m3fn"
            },
            "class_type": "UNETLoader",
            "_meta": {
              "title": "Load Diffusion Model"
            }
          },
          "13": {
            "inputs": {
              "noise": ["25", 0],
              "guider": ["22", 0],
              "sampler": ["16", 0],
              "sigmas": ["17", 0],
              "latent_image": ["5", 0]
            },
            "class_type": "SamplerCustomAdvanced",
            "_meta": {
              "title": "SamplerCustomAdvanced"
            }
          },
          "16": {
            "inputs": {
              "sampler_name": "euler"
            },
            "class_type": "KSamplerSelect",
            "_meta": {
              "title": "KSamplerSelect"
            }
          },
          "17": {
            "inputs": {
              "scheduler": "sgm_uniform",
              "steps": 28,
              "denoise": 1,
              "model": ["12", 0]
            },
            "class_type": "BasicScheduler",
            "_meta": {
              "title": "BasicScheduler"
            }
          },
          "22": {
            "inputs": {
              "model": ["12", 0],
              "conditioning": ["6", 0]
            },
            "class_type": "BasicGuider",
            "_meta": {
              "title": "BasicGuider"
            }
          },
          "25": {
            "inputs": {
              "noise_seed": randomizeSeed()
            },
            "class_type": "RandomNoise",
            "_meta": {
              "title": "RandomNoise"
            }
          }
        }
      }
    })
  };

  try {
    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const initialResponse = await response.json();
    
    if (!initialResponse.id) {
      throw new Error("No job ID received");
    }

    const result = await waitForCompletion(initialResponse.id);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const responses = await Promise.all(Array.from({ length: 5 }).map(async (_, index) => {
  try {
    const result = await generateImage();
    
    if (!result?.output?.message) {
      console.error(`Failed to generate image ${index}: Invalid response format`, result);
      return {
        index,
        timestamp: new Date().toISOString(),
        error: "Invalid response format",
        status: "failed"
      };
    }

    const image = Buffer.from(result.output.message, "base64");
    
    try {
      await fs.writeFile(`./results/${index}.png`, image);
      
      return {
        index,
        timestamp: new Date().toISOString(),
        delayTime: result.delayTime || 0,
        executionTime: result.executionTime || 0,
        status: "success"
      };
    } catch (writeError) {
      console.error(`Failed to save image ${index}:`, writeError);
      return {
        index,
        timestamp: new Date().toISOString(),
        error: `Failed to save image: ${writeError.message}`,
        status: "failed"
      };
    }
  } catch (error) {
    console.error(`Failed to process image ${index}:`, error);
    return {
      index,
      timestamp: new Date().toISOString(),
      error: error.message,
      status: "failed"
    };
  }
}));

try {
  await fs.writeFile('./results/responses.json', JSON.stringify(responses, null, 2));
  console.log("Process completed. Check responses.json for details.");
} catch (error) {
  console.error("Failed to save responses:", error);
}