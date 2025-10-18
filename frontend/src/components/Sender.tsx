import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ author: "You" | "Peer"; message: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = pcRef.current;

      switch (message.type) {
        case "meetingCreated":
          setMeetingId(message.meetingId);
          break;
        case "createAnswer":
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          break;
        case "iceCandidate":
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
        case "chat":
          setChatMessages(prev => [...prev, { author: "Peer", message: message.message }]);
          break;
      }
    };

    ws.onopen = () => ws.send(JSON.stringify({ type: "sender" }));
    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, []);

  const createMeeting = () => {
    if (socket) socket.send(JSON.stringify({ type: "createMeeting" }));
  };

  const initiateConn = async () => {
    if (!socket) return alert("Socket not found");
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: "createOffer", sdp: pc.localDescription }));
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // --- Chat ---
  const sendMessage = () => {
    if (socket && chatInput.trim()) {
      socket.send(JSON.stringify({ type: "chat", message: chatInput }));
      setChatMessages(prev => [...prev, { author: "You", message: chatInput }]);
      setChatInput("");
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMessage(); };

  // --- Audio/Video Toggle ---
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };
  const shareScreen = async () => {
  if (!pcRef.current) return alert("Call not started");

  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];

    // Replace the current video track in the peer connection
    const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
    if (sender) sender.replaceTrack(screenTrack);

    // When screen sharing stops, revert back to camera
    screenTrack.onended = async () => {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      if (sender) sender.replaceTrack(cameraTrack);
      if (videoRef.current) videoRef.current.srcObject = cameraStream;
      streamRef.current = cameraStream;
    };

    // Show screen in local video
    if (videoRef.current) videoRef.current.srcObject = screenStream;

  } catch (err) {
    console.error("Screen share error:", err);
    alert("Screen sharing failed or was canceled.");
  }
};

  return (
    

    <div className="flex flex-col md:flex-row min-h-screen bg-[#111827] text-white">
      {/* Video Section */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={createMeeting} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-lg">Create Meeting</button>
            <button onClick={initiateConn} disabled={!meetingId} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 font-bold py-3 px-6 rounded-lg">Start Call</button>
          </div>

          {meetingId && <div className="text-center p-3 bg-gray-800 rounded-lg">Meeting ID: <strong className="text-green-400 select-all">{meetingId}</strong></div>}

          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>

          {/* Audio/Video Controls */}
          <div className="flex gap-4 mt-4 justify-center">
            <button onClick={toggleAudio} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">{audioEnabled ? "Mute Mic" : "Unmute Mic"}</button>
            <button onClick={toggleVideo} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">{videoEnabled ? "Turn Camera Off" : "Turn Camera On"}</button>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-96 h-[50vh] md:h-screen flex flex-col bg-[#1f2937] border-l border-gray-600">
        <h2 className="text-xl font-bold p-4 border-b border-gray-600">Chat</h2>
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.author === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs ${msg.author === 'You' ? 'bg-blue-600' : 'bg-gray-600'}`}><p className="text-sm">{msg.message}</p></div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-600 flex gap-2">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="flex-grow p-2 rounded-lg bg-gray-700 border border-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={!meetingId} />
          <button onClick={sendMessage} disabled={!meetingId} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 font-bold py-2 px-4 rounded-lg">Send</button>
          <button onClick={shareScreen} className="share-screen ">
  Share Screen
</button>

        </div>
      </div>
    </div>
  );
};
