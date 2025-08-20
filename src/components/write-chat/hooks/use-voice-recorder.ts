"use client";

import { useCallback, useRef, useState } from "react";

import { auth as firebaseAuth } from "@/lib/firebase";

type UseVoiceRecorderOptions = {
  onTranscription?: (text: string) => void;
};

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const { onTranscription } = options;

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const processVoiceRecording = useCallback(
    async (audioBlob: Blob) => {
      try {
        const user = firebaseAuth?.currentUser;
        if (!user || typeof user.getIdToken !== "function") {
          console.error("Please sign in to use voice transcription");
          return;
        }
        const token = await user.getIdToken();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");
        const response = await fetch("/api/transcribe/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ audio: base64Audio, format: "wav" }),
        });
        const result = await response.json();
        if (result.success && result.transcription && typeof onTranscription === "function") {
          onTranscription(String(result.transcription));
        } else if (!result.success) {
          console.error("Transcription failed:", result.error);
        }
      } catch (error) {
        console.error("Error processing voice recording:", error);
      }
    },
    [onTranscription],
  );

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await processVoiceRecording(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }, [processVoiceRecording]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isRecording) {
      stop();
    } else {
      void start();
    }
  }, [isRecording, start, stop]);

  return { isRecording, start, stop, toggle };
}

export default useVoiceRecorder;
