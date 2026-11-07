/**
 * useWebcam — camera stream hook for the Vision Deficiency Simulator
 *
 * Wraps `navigator.mediaDevices.getUserMedia` for the optional live
 * camera/video simulation mode. Returns a ref to attach to a <video>
 * element plus lifecycle callbacks; the stream is always fully stopped
 * (`stop()` on every track) when stopped, unmounted, or on error.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type WebcamStatus =
  | "idle"
  | "starting"
  | "active"
  | "denied"
  | "unavailable"
  | "error";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    stopTracks();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setErrorMessage("");
  }, [stopTracks]);

  const start = useCallback(async () => {
    if (streamRef.current) return; // already active
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setStatus("unavailable");
      setErrorMessage(
        "Camera access is not supported in this browser or context.",
      );
      return;
    }
    setStatus("starting");
    setErrorMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          // Autoplay may be blocked until a user gesture; the video
          // element carries `playsInline` + muted so this is rare.
        });
      }
      setStatus("active");
    } catch (error) {
      stopTracks();
      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError")
      ) {
        setStatus("denied");
        setErrorMessage("Camera permission was denied or unavailable.");
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        setStatus("unavailable");
        setErrorMessage("No camera device was found.");
      } else {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to start camera.",
        );
      }
    }
  }, [stopTracks]);

  // Always release the camera when the component unmounts.
  useEffect(() => stopTracks, [stopTracks]);

  return { videoRef, status, errorMessage, start, stop };
}
