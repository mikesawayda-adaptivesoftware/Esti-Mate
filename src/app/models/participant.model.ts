import { Timestamp } from 'firebase/firestore';

export interface Participant {
  odId: string;
  name: string;
  vote: string | null;
  joinedAt: Timestamp;
}

export interface CreateParticipantData {
  odId: string;
  name: string;
  vote: string | null;
  joinedAt: Timestamp;
}

