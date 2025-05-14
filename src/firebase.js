import { FIREBASE_SERVICE } from "./config.js";
import { randomUUID } from "crypto";
import admin from "firebase-admin";

export const POD_STATUS = {
  IDLE: "IDLE",
  BUSY: "BUSY",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
};

export const TASK_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_SERVICE),
  });
}

const db = admin.firestore();

const ID = randomUUID();
const podRef = db.collection("pods").doc(ID);
const podLogsRef = db.collection("pods").doc(ID).collection("logs");

export const initPod = async () => {
  await podRef.create({
    id: ID,
    status: POD_STATUS.IDLE,
    created_at: admin.firestore.Timestamp.now(),
    updated_at: admin.firestore.Timestamp.now(),
  });
  return ID;
};

/**
 * @param {string} status
 * @description Changes the status of the pod
 */
export const changePodStatus = async (status) => {
  await podRef.update({
    status,
    updated_at: admin.firestore.Timestamp.now(),
  });
};

export const readPendingQueue = async () => {
  const snapshot = await podRef.collection("queue_pending").get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * @param {object} task
 * @param {string[]} outputs
 * @description Moves a pending task to the completed queue
 */
export const completedTask = async (task, outputs = []) => {
  const batch = db.batch();
  batch.create(podRef.collection("queue_completed").doc(task.id), {
    id: task.id,
    created_at: task.created_at,
    updated_at: admin.firestore.Timestamp.now(),
    status: outputs.length > 0 ? TASK_STATUS.COMPLETED : TASK_STATUS.ERROR,
    outputs,
  });
  batch.delete(podRef.collection("queue_pending").doc(task.id));
  await batch.commit();
};

/**
 * @param {string} message
 * @description Writes a log message to the pod's logs
 */
export const writePodLog = async (message) => {
  await podLogsRef.add({
    message,
    created_at: admin.firestore.Timestamp.now(),
  });
};
