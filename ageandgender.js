Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(start);

async function start() {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.marginTop = "50px";
  document.getElementById("uploads").append(container);

  let image;
  let canvas;
  async function predict() {
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = document.getElementById("imageUpload");
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    resizedDetections.forEach((result) => {
      const { age, gender, genderProbability } = result;
      new faceapi.draw.DrawTextField(
        [
          `나이: ${faceapi.round(age, 0)}세`,
          `성별: ${gender === "female" ? "여자" : "남자"} (${faceapi.round(
            genderProbability
          )})`
        ],
        result.detection.box.bottomLeft
      ).draw(canvas);
    });
  }
  predict();
}
