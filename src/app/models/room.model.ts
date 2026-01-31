import { Timestamp } from 'firebase/firestore';

export interface Room {
  id?: string;
  code: string;
  createdAt: Timestamp;
  revealed: boolean;
  currentTopic?: string;
}

export interface CreateRoomData {
  code: string;
  createdAt: Timestamp;
  revealed: boolean;
  currentTopic: string;
}

