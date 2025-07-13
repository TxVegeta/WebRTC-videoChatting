import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
      setConnected(true);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnected(false);
    };

    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
      setConnected(false);
    };
  }, []);

  const initiateConn = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: "iceCandidate",
          candidate: event.candidate
        }));
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({
        type: "createOffer",
        sdp: pc.localDescription
      }));
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or not available.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📤 Sender</h2>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg border border-gray-300 shadow-sm mb-4"
        />
        <button
          onClick={initiateConn}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Send Data
        </button>
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
