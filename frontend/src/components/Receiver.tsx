import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
      setConnected(true);
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: "createAnswer", sdp: pc.localDescription }));
      } else if (message.type === "iceCandidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
      }
    };

    return () => {
      pc.close();
      socket.close();
      setConnected(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎥 Receiver</h2>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          muted
          className="w-full rounded-lg border border-gray-300 shadow-sm"
        />
        <div className="mt-4">
          <span
            className={`inline-block px-4 py-1 text-sm font-medium rounded-full ${
              connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {connected ? "Connected to Signaling Server" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
};
