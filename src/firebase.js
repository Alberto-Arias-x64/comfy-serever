import { FIREBASE_SERVICE } from "./config.js";
import { randomUUID } from "crypto";
import admin from "firebase-admin";

/**
 * @description The status of a pod
 * @enum {string}
 */
export const POD_STATUS = {
  IDLE: "IDLE",
  BUSY: "BUSY",
  ERROR: "ERROR",
};

/**
 * @description The status of a task
 * @enum {string}
 */
export const TASK_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
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
const podsListRef = db.collection("pods").doc("admin_list");
const podLogsRef = db.collection("pods").doc(ID).collection("logs");
const queuePendingRef = db.collection("queue_pending");
const queueCompletedRef = db.collection("queue_completed");

/**
 * @description Initializes a pod
 * @returns {Promise<string>} The ID of the pod
 */
export const initPod = async () => {
  if (!(await podsListRef.get().exists)) await podsListRef.create({ last_assigned_pod: "", pods: [] });
  const batch = db.batch();
  batch.create(podRef, {
    id: ID,
    is_active: true,
    status: POD_STATUS.IDLE,
    created_at: admin.firestore.Timestamp.now(),
    updated_at: admin.firestore.Timestamp.now(),
  });
  batch.update(podsListRef, {
    pods: admin.firestore.FieldValue.arrayUnion(ID),
  });
  await batch.commit();
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

/**
 * @param {string} id
 * @param {string} status
 * @description Changes the status of a task
 */
export const changeTaskStatus = async (id, status) => {
  await queuePendingRef.doc(id).update({
    status,
    updated_at: admin.firestore.Timestamp.now(),
  });
};

/**
 * @description Reads the pending queue
 * @returns {Promise<object[]>} The pending tasks
 */
export const readPendingQueue = async () => {
  const snapshot = await queuePendingRef.where("pod_id", "==", ID).get();
  const tasks = snapshot.docs.map((doc) => doc.data());
  return tasks.sort((a, b) => a.created_at - b.created_at);
};

/**
 * @param {object} task
 * @param {string[]} outputs
 * @description Moves a pending task to the completed queue
 */
export const completedTask = async (task, outputs = []) => {
  const batch = db.batch();
  batch.create(queueCompletedRef.doc(task.id), {
    id: task.id,
    created_at: task.created_at,
    updated_at: admin.firestore.Timestamp.now(),
    status: outputs.length > 0 ? TASK_STATUS.COMPLETED : TASK_STATUS.ERROR,
    pod_id: ID,
    outputs,
  });
  batch.delete(queuePendingRef.doc(task.id));
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
