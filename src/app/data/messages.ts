export interface ChatMessage {
  id: string;
  senderId: "me" | string;
  content: string;
  timestamp: string;
  read: boolean;
  type: "text";
}

export interface Conversation {
  id: string;
  name: string;
  role: "doctor" | "patient";
  avatar: string;
  specialty?: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Dr. Amara Osei",
    role: "doctor",
    avatar: "photo-1612349317150-e413f6a5b16d",
    specialty: "Cardiology",
    online: true,
    lastMessage: "Your ECG results look good. Follow-up in 3 weeks.",
    lastTime: "10:32 AM",
    unread: 2,
    messages: [
      { id: "m1", senderId: "c1",  content: "Good morning! I've reviewed your recent ECG results.", timestamp: "9:15 AM", read: true, type: "text" },
      { id: "m2", senderId: "me",  content: "Good morning, Dr. Osei. Should I be concerned about anything?", timestamp: "9:18 AM", read: true, type: "text" },
      { id: "m3", senderId: "c1",  content: "Not at all. The reading shows normal sinus rhythm. Your Metoprolol is working well.", timestamp: "9:22 AM", read: true, type: "text" },
      { id: "m4", senderId: "me",  content: "That's a relief. Any changes to my medication schedule?", timestamp: "9:25 AM", read: true, type: "text" },
      { id: "m5", senderId: "c1",  content: "No changes needed. Continue the current dose. I'd like to see you again in 3 weeks for a follow-up.", timestamp: "9:28 AM", read: true, type: "text" },
      { id: "m6", senderId: "me",  content: "I'll book an appointment today.", timestamp: "9:30 AM", read: true, type: "text" },
      { id: "m7", senderId: "c1",  content: "Your ECG results look good. Follow-up in 3 weeks.", timestamp: "10:32 AM", read: false, type: "text" },
      { id: "m8", senderId: "c1",  content: "Also, remember to monitor your blood pressure twice daily and log the readings.", timestamp: "10:33 AM", read: false, type: "text" },
    ],
  },
  {
    id: "c2",
    name: "Dr. Priya Nair",
    role: "doctor",
    avatar: "photo-1594824476967-48c8b964273f",
    specialty: "General Practice",
    online: false,
    lastMessage: "Your Vitamin D supplements are working. Keep it up!",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      { id: "m9",  senderId: "c2",  content: "Hi Alex, I've reviewed your latest blood panel. Your Vitamin D is coming up nicely.", timestamp: "Yesterday 2:10 PM", read: true, type: "text" },
      { id: "m10", senderId: "me",  content: "That's great to hear! The supplements seem to be working.", timestamp: "Yesterday 2:15 PM", read: true, type: "text" },
      { id: "m11", senderId: "c2",  content: "Your Vitamin D supplements are working. Keep it up! Recheck in 90 days.", timestamp: "Yesterday 2:16 PM", read: true, type: "text" },
    ],
  },
  {
    id: "c3",
    name: "Dr. Lena Kovač",
    role: "doctor",
    avatar: "photo-1559839734-2b71ea197ec2",
    specialty: "Neurology",
    online: true,
    lastMessage: "How is the new migraine prevention plan working for you?",
    lastTime: "Mon",
    unread: 1,
    messages: [
      { id: "m12", senderId: "c3",  content: "Hi Alex, I wanted to follow up on your migraine frequency since we updated your plan.", timestamp: "Mon 11:00 AM", read: true, type: "text" },
      { id: "m13", senderId: "me",  content: "The Topiramate has definitely reduced the episodes. Down from 6 per month to maybe 2.", timestamp: "Mon 11:15 AM", read: true, type: "text" },
      { id: "m14", senderId: "c3",  content: "That's excellent progress! Any side effects so far?", timestamp: "Mon 11:18 AM", read: true, type: "text" },
      { id: "m15", senderId: "me",  content: "Slight tingling in my hands occasionally, but nothing severe.", timestamp: "Mon 11:20 AM", read: true, type: "text" },
      { id: "m16", senderId: "c3",  content: "How is the new migraine prevention plan working for you?", timestamp: "Mon 3:45 PM", read: false, type: "text" },
    ],
  },
];
