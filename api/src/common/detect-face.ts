const faceapi = require("face-api.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

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
  const canvas = createCanvas(image.width/4, image.height/4);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width/4, image.height/4);
  // Convert canvas to tensor
  const tensor = faceapi.tf.browser.fromPixels(canvas);
  // Create net input
  // const netInput = faceapi.tf.expandDims(tensor);
  // Detect a single face using the tinyFaceDetector
  const detection = await faceapi.detectSingleFace(tensor, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  // Dispose the tensor to free up memory
  tensor.dispose();

  return detection;
}
