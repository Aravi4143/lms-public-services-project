const faceapi = require("face-api.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
import { getConfig } from "./config";

// Load models
const MODEL_URL = path.join(__dirname, "/models");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
]).then(() => {
  console.log("Models loaded successfully!");
});

export default async function detectFace(imagePath: any): Promise<any> {
  const image = await loadImage(imagePath);
  // Create canvas
  const canvas = createCanvas(image.width/6, image.height/6);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width/6, image.height/6);
  // Convert canvas to tensor
  const tensor = faceapi.tf.browser.fromPixels(canvas);
  // Detect a single face using the tinyFaceDetector
  const startTime = new Date();
  const detection = await faceapi.detectSingleFace(tensor.toFloat(), new faceapi.TinyFaceDetectorOptions({
    inputSize: 128 // common sizes are 128, 160, 224, 320, 416, 512, 608
    }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  const endTime = new Date();
  console.log("Detection Time in sec:", (endTime.getTime() - startTime.getTime())/1000);

  // Dispose the tensor to free up memory
  tensor.dispose();

  return detection;
}
