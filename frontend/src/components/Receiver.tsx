import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1e3a5f] to-[#2d5a8c] p-6 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white transition-colors duration-200 group">
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Join Call</h2>
                  <p className="text-blue-200">Receiving video stream...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  connected ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`} />
                <span className="text-white font-medium">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 shadow-2xl mb-8">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                muted
                className="w-full aspect-video object-cover"
              />
              {connected && (
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white font-semibold">Live Stream</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="font-medium">HD Quality</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2 text-blue-200">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
                  <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
                </div>
                <span className="font-medium">Low Latency</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-8 py-5 bg-white/5">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Fast Connection</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Peer-to-Peer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
