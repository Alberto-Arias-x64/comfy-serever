import { initPod, readPendingQueue, completedTask, POD_STATUS, changePodStatus, writePodLog } from "./firebase.js";
import { uploadImage } from "./cloudflare.js";
import CreatePrediction from "./comfy.js";
import { Logger } from "./logs.js";
import fs from "fs/promises";

const logger = Logger.getInstance();
let podStatus = POD_STATUS.IDLE;

try {
  const ID = await initPod();
  await logger.info(`Pod ${ID} initialized`);
  await writePodLog(`Pod ${ID} initialized`);

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pendingTasks = await readPendingQueue();
    if (pendingTasks.length === 0) {
      if (podStatus === POD_STATUS.IDLE) continue;
      await changePodStatus(POD_STATUS.IDLE);
      continue;
    }

    podStatus = POD_STATUS.BUSY;
    await changePodStatus(POD_STATUS.BUSY);

    const task = pendingTasks[0];
    const { id, data } = task;

    try{
      const outputs = await CreatePrediction({ prompt: data?.["prompt"] });
      if (outputs === null) {
        await completedTask(task, []);
        await logger.error("Error creating prediction", { ...task });
        await writePodLog(`Error creating prediction: ${task.id}`);
      }
      else {
        const uploadPromises = outputs.map(async (output) => {
          const image = await fs.readFile(output);
          return await uploadImage(image, id);
        });
        const uploadedImages = await Promise.all(uploadPromises);
        await completedTask(task, uploadedImages);
        await logger.info("Task completed", { ...task });
        await writePodLog(`Task ${task.id} completed`);
  
        // Clean up the outputs
        outputs.forEach(async (output) => {
          await fs.unlink(output);
        });
      }
    } catch (error) {
      await logger.error("Error in task", { task: { ...task }, name: error.name, message: error.message, stack: error?.stack, cause: error?.cause });
      await writePodLog(`Error in task: ${error.message}`);
    }
  }
} catch (error) {
  await logger.error("Error in pod", { name: error.name, message: error.message, stack: error?.stack, cause: error?.cause });
  await writePodLog(`Error in pod: ${error.message}`);
  await changePodStatus(POD_STATUS.ERROR);
  process.exit(1);
}
