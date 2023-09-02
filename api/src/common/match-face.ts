const faceapi = require("face-api.js");

export default async function matchFace(actual: Float32Array, expected: Float32Array): Promise<boolean> {
  // Compute distances between actualFaceDescriptor and expectedFaceDescriptor
  const distances = [];
    distances.push({
      distance: faceapi.euclideanDistance(
        expected,
        actual
      ),
    });

  // Find the person with the smallest distance
  const bestMatch = distances.reduce((best, current) =>
    current.distance < best.distance ? current : best
  );
  console.log("Best match found while matching face: ", bestMatch);

  // Return the best match if the distance is below a threshold
  if (bestMatch.distance < 0.5) {
    return true;
  } else {
    return false;
  }
  }