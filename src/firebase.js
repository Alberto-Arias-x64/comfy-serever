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
const podRef = db.collection("pots").doc(ID);

export const initPod = async () => {
  await podRef.create({
    id: ID,
    status: POD_STATUS.IDLE,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
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
    updatedAt: admin.firestore.Timestamp.now(),
  });
};

export const readPendingQueue = async () => {
  const snapshot = await db.collection(podRef.path, "queue_pending").get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * @param {string} id
 * @param {string} status
 * @param {string[]} outputs
 * @description Moves a pending task to the completed queue
 */
export const moveToCompletedQueue = async (id, status, outputs = []) => {
  const batch = db.batch();
  batch.create(db.collection(podRef.path, "queue_completed").doc(id), {
    id,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    status,
    outputs,
  });
  batch.delete(db.collection(podRef.path, "queue_pending").doc(id));
  await batch.commit();
};
