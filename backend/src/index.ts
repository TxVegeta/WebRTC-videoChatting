import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8080 });

// Keep track of a single sender/receiver for legacy logic
let senderSocket: (WebSocket & { meetingId?: string }) | null = null;
let receiverSocket: (WebSocket & { meetingId?: string }) | null = null;


// Meetings map for multiple call sessions
const meetings: Record<string, { sender: WebSocket; receiver: WebSocket | null }> = {};

wss.on('connection', function connection(ws: WebSocket & { meetingId?: string }) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    let message;
    try {
      message = JSON.parse(data);
    } catch (err) {
      console.error("Invalid JSON:", data);
      return;
    }

    // ----- Create new meeting -----
    if (message.type === 'createMeeting') {
      const meetingId = uuidv4();
      ws.meetingId = meetingId;
      meetings[meetingId] = { sender: ws, receiver: null };
      ws.send(JSON.stringify({ type: 'meetingCreated', meetingId }));
      console.log("Meeting created:", meetingId);
      return;
    }

    // ----- Join existing meeting -----
    if (message.type === 'joinMeeting') {
      const meeting = meetings[message.meetingId];
      if (meeting && meeting.sender) {
        receiverSocket = ws; // optional, for legacy logic
        ws.meetingId = message.meetingId;
        meeting.receiver = ws;

        // Notify both parties
        meeting.sender.send(JSON.stringify({ type: 'receiverJoined', meetingId: message.meetingId }));
        ws.send(JSON.stringify({ type: 'meetingJoined', meetingId: message.meetingId }));
        console.log("Receiver joined meeting:", message.meetingId);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid meeting ID' }));
      }
      return;
    }
    // Inside ws.on('message')
   if (message.type === 'chat' && ws.meetingId) {
  const meeting = meetings[ws.meetingId];
  // Send to the other participant
   if (ws === meeting.sender && meeting.receiver) {
    meeting.receiver.send(JSON.stringify({ type: 'chat', message: message.message }));
   } else if (ws === meeting.receiver && meeting.sender) {
    meeting.sender.send(JSON.stringify({ type: 'chat', message: message.message }));
      }
   }

    // ----- EXISTING LOGIC -----
    if (message.type === 'sender') {
      console.log("sender added");
      senderSocket = ws;
    } else if (message.type === 'receiver') {
      console.log("receiver added");
      receiverSocket = ws;
    } else if (message.type === 'createOffer') {
      if (ws !== senderSocket) return;
      console.log("sending offer");
      receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === 'createAnswer') {
      if (ws !== receiverSocket) return;
      console.log("sending answer");
      senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === 'iceCandidate') {
      console.log("sending ice candidate");
      if (ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });

  ws.on('close', () => {
    // Clean up meeting if this ws was part of it
    if (ws.meetingId && meetings[ws.meetingId]) {
      console.log("Closing meeting:", ws.meetingId);
      delete meetings[ws.meetingId];
    }
  });
});

console.log("✅ WebSocket Server running on ws://localhost:8080");
