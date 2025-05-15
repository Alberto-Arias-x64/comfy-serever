import { initPod, readPendingQueue, completedTask, POD_STATUS, changePodStatus, writePodLog, changeTaskStatus, TASK_STATUS } from "./firebase.js";
import { CLOUDFLARE_SERVICE, FIREBASE_SERVICE, POLLING_TIME } from "./config.js";
import { getAspectRatio, createPrediction } from "./comfy.js";
import { diffMilliseconds } from "@formkit/tempo";
import { uploadImage } from "./cloudflare.js";
import { Logger } from "./logs.js";
import fs from "fs/promises";

const logger = Logger.getInstance();
let podStatus = POD_STATUS.IDLE;

if (CLOUDFLARE_SERVICE === null) {
  logger.error("Cloudflare service not found");
  process.exit(1);
}

if (FIREBASE_SERVICE === null) {
  logger.error("Firebase service not found");
  process.exit(1);
}

try {
  const ID = await initPod();
  await logger.info(`Pod ${ID} initialized`);
  await writePodLog(`Pod ${ID} initialized`);

  while (true) {
    await new Promise(resolve => setTimeout(resolve, POLLING_TIME));
    const pendingTasks = await readPendingQueue();
    if (pendingTasks.length === 0) {
      if (podStatus === POD_STATUS.IDLE) continue;
      podStatus = POD_STATUS.IDLE;
      await changePodStatus(POD_STATUS.IDLE);
      continue;
    }

    podStatus = POD_STATUS.BUSY;
    await changePodStatus(POD_STATUS.BUSY);

    const task = pendingTasks[0];
    const { id, data } = task;
    await changeTaskStatus(id, TASK_STATUS.PROCESSING);

    try {
      const startTime = new Date().toISOString();
      const { width, height } = getAspectRatio(data?.["aspect_ratio"]);
      const outputs = await createPrediction({ prompt: data?.["prompt"], width, height });
      if (outputs === null) {
        await completedTask(task);
        await logger.error("Error creating prediction", { ...task });
        await writePodLog(`Error creating prediction: ${task.id}`);
      }
      else {
        const uploadPromises = outputs.map(async (output) => {
          const image = await fs.readFile(output);
          return await uploadImage(image, id);
        });
        const uploadedImages = await Promise.all(uploadPromises);
        await completedTask(task, uploadedImages[0]);
        const endTime = new Date().toISOString();
        const totalTime = (diffMilliseconds(startTime, endTime) / 1000).toFixed(2);
        await logger.info("Task completed", { totalTime, ...task });
        await writePodLog(`Task ${task.id} completed in ${totalTime}s`);

        // Clean up the outputs
        outputs.forEach(async (output) => {
          await fs.unlink(output);
        });
      }
    } catch (error) {
      await logger.error("Error in task", { task: { ...task }, name: error.name, message: error.message, stack: error?.stack?.split("\n"), cause: error?.cause });
      await writePodLog(`Error in task: ${error.message}`);
      await completedTask(task);
    }
  }
} catch (error) {
  await logger.error("Error in pod", { name: error.name, message: error.message, stack: error?.stack?.split("\n"), cause: error?.cause });
  await writePodLog(`Error in pod: ${error.message}`);
  await changePodStatus(POD_STATUS.ERROR);
  process.exit(1);
}
