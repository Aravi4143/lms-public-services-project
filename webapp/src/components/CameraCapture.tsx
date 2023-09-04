import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";


function CameraCapture({
    onCapture,
  }: {
    onCapture: (image: File, e: React.MouseEvent<HTMLButtonElement> ) => void;
  }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
  
    const [showCaptureButton, setShowCaptureButton] = useState(false);
    const [showAuthorizeButton, setShowAuthorizeButton] = useState(true);
  
    const startCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setShowCaptureButton(true); // Show the "CAPTURE" button
            setShowAuthorizeButton(false); // Hide the "Authorize face" button
          };
          streamRef.current = stream;
        }
      } catch (error) {
        console.error("Error starting camera:", error);
        toast("Error starting camera", { type: "error" });
      }
    };
  
    const dataURLtoFile = (dataurl: string, filename: string) => {
      try {
        const arr = dataurl.split(",");
        const bstr = window.atob(arr[1]); // Decode base64 data
        const mime = arr[0].match(/:(.*?);/)?.[1] || "";
        const byteArray = new Uint8Array(bstr.length);
  
        for (let i = 0; i < bstr.length; i++) {
          byteArray[i] = bstr.charCodeAt(i);
        }
  
        return new File([byteArray], filename, { type: mime });
      } catch (error) {
        console.error("Error converting data URL to file:", error);
        return null;
      }
    };
  
    const handleCamCapture = async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext("2d");
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          if (context) {
            context.drawImage(
              videoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
  
            const imageData = canvasRef.current.toDataURL("image/jpeg");
            const imageFile = dataURLtoFile(imageData, "captured.jpg");
  
            // Stop the video stream
            if (imageFile && streamRef.current) {
              onCapture(imageFile, e);
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Error capturing image:", error);
        toast("Error capturing image", { type: "error" });
      }
    };
  
    return (
      <div>
        <video
          ref={videoRef}
          autoPlay
          style={{ display: showAuthorizeButton ? "none" : "block" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50px",
          }}
        >
          {showAuthorizeButton && (
            <button className="btn btn-primary" onClick={() => startCamera()}>
              Facial Recognition
            </button>
          )}
          {showCaptureButton && (
            <button className="btn btn-primary" onClick={handleCamCapture}>
              CAPTURE
            </button>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    );
  }


export default CameraCapture