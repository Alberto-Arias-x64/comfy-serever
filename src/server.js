import { initPod, readPendingQueue } from "./firebase.js";
import CreatePrediction from "./comfy.js";
import { Logger } from "./logs.js";

const logger = Logger.getInstance();

try {
  const ID = await initPod();
  logger.info(`Pod ${ID} initialized`);

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pendingTasks = await readPendingQueue();
    if (pendingTasks.length === 0) continue;

    const task = pendingTasks[0];
    const { prompt, id } = task;

    const outputs = await CreatePrediction(prompt);
    if (outputs === null) {
      logger.error("Error creating prediction", { id, prompt });
    }
  }
} catch (error) {
  if (error instanceof Error) {
    logger.error("Error initializing pod", { name: error.name, message: error.message, stack: error?.stack?.split("\n"), cause: error?.cause });
  } else {
    logger.error("Error initializing pod", { message: error });
  }
  process.exit(1);
}
