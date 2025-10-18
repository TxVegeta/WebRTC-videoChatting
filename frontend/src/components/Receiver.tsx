import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [meetingId, setMeetingId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ author: "You" | "Peer"; message: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = pcRef.current;

      switch (message.type) {
        case "createOffer":
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "createAnswer", sdp: pc.localDescription }));
          }
          break;
        case "iceCandidate":
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
        case "chat":
          setChatMessages(prev => [...prev, { author: "Peer", message: message.message }]);
          break;
      }
    };

    ws.onopen = () => ws.send(JSON.stringify({ type: "receiver" }));
    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => setIsJoined(false);

    return () => ws.close();
  }, []);

  const joinMeeting = async () => {
    if (!socket || !meetingId) return;
    socket.send(JSON.stringify({ type: "joinMeeting", meetingId }));
    setIsJoined(true);

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      streamRef.current = event.streams[0] as MediaStream;
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
    };
  };

  const sendMessage = () => {
    if (socket && chatInput.trim()) {
      socket.send(JSON.stringify({ type: "chat", message: chatInput }));
      setChatMessages(prev => [...prev, { author: "You", message: chatInput }]);
      setChatInput("");
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMessage(); };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack?.enabled ?? true);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack?.enabled ?? true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#111827] text-white">
      {/* Video Section */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {!isJoined ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="Enter Meeting ID" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} className="flex-grow p-3 rounded-lg text-black bg-gray-200" />
            <button onClick={joinMeeting} disabled={!socket || !meetingId} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 font-bold py-3 px-6 rounded-lg">Join Meeting</button>
          </div>
        ) : (
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            Joined Meeting: <strong className="text-green-400">{meetingId}</strong>
            <p className="text-gray-400 text-sm mt-1">Waiting for sender to start the call...</p>
          </div>
        )}

        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl mt-4">
          <video ref={videoRef} autoPlay playsInline controls className="w-full h-full object-cover" />
        </div>

        {isJoined && (
          <div className="flex gap-4 mt-4 justify-center">
            <button onClick={toggleAudio} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">{audioEnabled ? "Mute Mic" : "Unmute Mic"}</button>
            <button onClick={toggleVideo} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">{videoEnabled ? "Turn Camera Off" : "Turn Camera On"}</button>
          </div>
        )}
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
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="flex-grow p-2 rounded-lg bg-gray-700 border border-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={!isJoined} />
          <button onClick={sendMessage} disabled={!isJoined} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 font-bold py-2 px-4 rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
};
