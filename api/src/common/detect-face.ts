import {
  nets,
  tf,
  detectSingleFace,
  TinyFaceDetectorOptions,
} from "face-api.js";
import { createCanvas, loadImage } from "canvas";
import path from "path";

const MODEL_URL = path.join(__dirname, "/models");
Promise.all([
  nets.tinyFaceDetector.loadFromDisk(MODEL_URL),
  nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
]).then(() => {
  console.log("Models loaded successfully!");
});

export default async function detectFace(
  imagePath: string
): Promise<string | undefined> {
  const image = await loadImage(imagePath);
  // Create canvas
  const canvas = createCanvas(image.width / 6, image.height / 6);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width / 6, image.height / 6);
  // Convert canvas to tensor
  const tensor = tf.browser.fromPixels(canvas);
  // Detect a single face using the tinyFaceDetector
  const startTime = new Date();
  const detection = await detectSingleFace(
    tensor.toFloat(),
    new TinyFaceDetectorOptions({
      inputSize: 128, // common sizes are 128, 160, 224, 320, 416, 512, 608
    })
  )
    .withFaceLandmarks()
    .withFaceDescriptor();
  const endTime = new Date();
  console.log(
    "Detection Time in sec:",
    (endTime.getTime() - startTime.getTime()) / 1000
  );

  // Dispose the tensor to free up memory
  tensor.dispose();

  return detection ? String(detection.descriptor) : undefined;
}
