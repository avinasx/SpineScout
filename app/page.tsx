'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { audioService } from '@/utils/audioService';
import { persistenceService } from '@/utils/persistenceService';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

function calculateAngle(p1: any, p2: any, p3: any): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

function isGoodPosture(landmarks: any[]): boolean {
  // MediaPipe Pose landmarks: 11=left_shoulder, 12=right_shoulder, 23=left_hip, 24=right_hip, 7=left_ear, 8=right_ear
  const rightEar = landmarks[8];
  const rightShoulder = landmarks[12];
  const rightHip = landmarks[24];

  if (!rightEar || !rightShoulder || !rightHip) {
    return true;
  }

  if (rightEar.visibility < 0.5 || rightShoulder.visibility < 0.5 || rightHip.visibility < 0.5) {
    return true;
  }

  const angle = calculateAngle(rightHip, rightShoulder, rightEar);
  return angle >= 160;
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [postureStatus, setPostureStatus] = useState<'Good' | 'Bad' | 'Detecting...'>('Detecting...');
  const [badPostureDuration, setBadPostureDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef<number>(0);
  const lastLogTimeRef = useRef<number>(0);

  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });

      setPoseLandmarker(landmarker);
      setIsLoading(false);
    };

    initMediaPipe();
  }, []);

  useEffect(() => {
    if (isMonitoring && poseLandmarker) {
      requestRef.current = requestAnimationFrame(detectPose);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isMonitoring, poseLandmarker]);

  // Show auth form if not logged in (after all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const startCamera = async () => {
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsMonitoring(true);
        persistenceService.startSession();
        detectPose();
      };
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
    cancelAnimationFrame(requestRef.current);
    audioService.stopBeep();
  };

  const detectPose = () => {
    if (
      poseLandmarker &&
      videoRef.current &&
      videoRef.current.readyState === 4 &&
      canvasRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const startTimeMs = performance.now();
      const results = poseLandmarker.detectForVideo(video, startTimeMs);

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Draw skeleton
          const drawingUtils = new DrawingUtils(ctx);
          drawingUtils.drawLandmarks(landmarks, {
            radius: 5,
            color: '#00ff00',
            fillColor: '#00ff00'
          });
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#00ff00',
            lineWidth: 2
          });

          const isGood = isGoodPosture(landmarks);

          if (isGood) {
            setPostureStatus('Good');
            audioService.stopBeep();
          } else {
            setPostureStatus('Bad');
            audioService.playBeep();

            const now = Date.now();
            if (now - lastLogTimeRef.current > 1000) {
              setBadPostureDuration((prev) => {
                const newVal = prev + 1;
                persistenceService.updateSession(newVal);
                return newVal;
              });
              lastLogTimeRef.current = now;
            }
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(detectPose);
  };

  return (
    <main className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">
            Real-Time Posture Monitoring
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {isLoading && <span className="loading loading-spinner loading-lg text-primary"></span>}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full transform -scale-x-100"
              />
              {!isMonitoring && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <button className="btn btn-primary btn-lg" onClick={startCamera}>
                    Start Monitoring
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className={`alert ${postureStatus === 'Good' ? 'alert-success' : postureStatus === 'Bad' ? 'alert-error' : 'alert-info'} shadow-lg`}>
                <div>
                  <h3 className="font-bold text-lg">Status</h3>
                  <div className="text-2xl font-black uppercase tracking-widest">
                    {postureStatus}
                  </div>
                </div>
              </div>

              <div className="stats shadow bg-base-200 w-full">
                <div className="stat">
                  <div className="stat-title">Bad Posture Duration</div>
                  <div className="stat-value text-secondary">{badPostureDuration}s</div>
                  <div className="stat-desc">Session Total</div>
                </div>
              </div>

              <div className="card bg-base-200 p-4">
                <h3 className="font-bold mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-sm opacity-75">
                  <li>Sit comfortably in front of the camera.</li>
                  <li>Ensure your head and shoulders are visible.</li>
                  <li>Keep your back straight.</li>
                  <li>An alert will sound if you slouch.</li>
                </ul>
              </div>

              {isMonitoring && (
                <button className="btn btn-error w-full mt-auto" onClick={stopCamera}>
                  Stop Monitoring
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
