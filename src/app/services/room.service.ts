import { Injectable, signal, computed } from '@angular/core';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Room, CreateRoomData } from '../models/room.model';
import { Participant, CreateParticipantData } from '../models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  // Signals for reactive state
  private _currentRoom = signal<Room | null>(null);
  private _participants = signal<Participant[]>([]);
  private _currentParticipantId = signal<string | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly currentRoom = this._currentRoom.asReadonly();
  readonly participants = this._participants.asReadonly();
  readonly currentParticipantId = this._currentParticipantId.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly allVoted = computed(() => {
    const participants = this._participants();
    if (participants.length === 0) return false;
    return participants.every(p => p.vote !== null);
  });

  readonly hasConsensus = computed(() => {
    const room = this._currentRoom();
    const participants = this._participants();
    
    if (!room?.revealed || participants.length < 2) return false;
    
    const votes = participants.map(p => p.vote).filter(v => v !== null && v !== '?');
    if (votes.length < 2) return false;
    
    return votes.every(v => v === votes[0]);
  });

  readonly consensusValue = computed(() => {
    if (!this.hasConsensus()) return null;
    const participants = this._participants();
    const vote = participants.find(p => p.vote !== null && p.vote !== '?')?.vote;
    return vote ?? null;
  });

  private roomUnsubscribe: Unsubscribe | null = null;
  private participantsUnsubscribe: Unsubscribe | null = null;

  constructor(private firebase: FirebaseService) {
    // Initialize participant ID from session storage
    const storedId = sessionStorage.getItem('participantId');
    if (storedId) {
      this._currentParticipantId.set(storedId);
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateParticipantId(): string {
    return 'p_' + Math.random().toString(36).substring(2, 15);
  }

  async createRoom(): Promise<string> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const roomRef = doc(collection(this.firebase.firestore, 'rooms'));
      const roomData: CreateRoomData = {
        code: this.generateRoomCode(),
        createdAt: Timestamp.now(),
        revealed: false,
        currentTopic: ''
      };

      await setDoc(roomRef, roomData);
      return roomRef.id;
    } catch (err) {
      this._error.set('Failed to create room');
      throw err;
    } finally {
      this._isLoading.set(false);
    }
  }

  async findRoomByCode(code: string): Promise<string | null> {
    const roomsRef = collection(this.firebase.firestore, 'rooms');
    const q = query(roomsRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  }

  async joinRoom(roomId: string, name: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Check if room exists
      const roomRef = doc(this.firebase.firestore, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      // Get or create participant ID
      let odId = this._currentParticipantId();
      if (!odId) {
        odId = this.generateParticipantId();
        sessionStorage.setItem('participantId', odId);
        this._currentParticipantId.set(odId);
      }

      // Store name in localStorage
      localStorage.setItem('userName', name);

      // Create or update participant
      const participantRef = doc(this.firebase.firestore, 'rooms', roomId, 'participants', odId);
      const participantData: CreateParticipantData = {
        odId,
        name,
        vote: null,
        joinedAt: Timestamp.now()
      };

      await setDoc(participantRef, participantData);

      // Subscribe to room updates
      this.subscribeToRoom(roomId);
    } catch (err) {
      this._error.set('Failed to join room');
      throw err;
    } finally {
      this._isLoading.set(false);
    }
  }

  subscribeToRoom(roomId: string): void {
    // Unsubscribe from previous subscriptions
    this.unsubscribeFromRoom();

    const roomRef = doc(this.firebase.firestore, 'rooms', roomId);
    
    // Subscribe to room changes
    this.roomUnsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        this._currentRoom.set({
          id: snapshot.id,
          ...snapshot.data()
        } as Room);
      } else {
        this._currentRoom.set(null);
      }
    });

    // Subscribe to participants changes
    const participantsRef = collection(this.firebase.firestore, 'rooms', roomId, 'participants');
    this.participantsUnsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participants: Participant[] = [];
      snapshot.forEach((doc) => {
        participants.push(doc.data() as Participant);
      });
      // Sort by join time
      participants.sort((a, b) => a.joinedAt.toMillis() - b.joinedAt.toMillis());
      this._participants.set(participants);
    });
  }

  unsubscribeFromRoom(): void {
    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
      this.roomUnsubscribe = null;
    }
    if (this.participantsUnsubscribe) {
      this.participantsUnsubscribe();
      this.participantsUnsubscribe = null;
    }
    this._currentRoom.set(null);
    this._participants.set([]);
  }

  async vote(value: string): Promise<void> {
    const room = this._currentRoom();
    const odId = this._currentParticipantId();
    
    if (!room?.id || !odId) return;

    const participantRef = doc(this.firebase.firestore, 'rooms', room.id, 'participants', odId);
    await updateDoc(participantRef, { vote: value });
  }

  async revealVotes(): Promise<void> {
    const room = this._currentRoom();
    if (!room?.id) return;

    const roomRef = doc(this.firebase.firestore, 'rooms', room.id);
    await updateDoc(roomRef, { revealed: true });
  }

  async resetVotes(): Promise<void> {
    const room = this._currentRoom();
    if (!room?.id) return;

    // Reset room revealed state
    const roomRef = doc(this.firebase.firestore, 'rooms', room.id);
    await updateDoc(roomRef, { revealed: false });

    // Reset all participant votes
    const participants = this._participants();
    const updates = participants.map(p => {
      const participantRef = doc(this.firebase.firestore, 'rooms', room.id!, 'participants', p.odId);
      return updateDoc(participantRef, { vote: null });
    });

    await Promise.all(updates);
  }

  async updateTopic(topic: string): Promise<void> {
    const room = this._currentRoom();
    if (!room?.id) return;

    const roomRef = doc(this.firebase.firestore, 'rooms', room.id);
    await updateDoc(roomRef, { currentTopic: topic });
  }

  async leaveRoom(): Promise<void> {
    const room = this._currentRoom();
    const odId = this._currentParticipantId();
    
    if (room?.id && odId) {
      const participantRef = doc(this.firebase.firestore, 'rooms', room.id, 'participants', odId);
      await deleteDoc(participantRef);
    }

    this.unsubscribeFromRoom();
  }

  getCurrentParticipant(): Participant | null {
    const odId = this._currentParticipantId();
    if (!odId) return null;
    return this._participants().find(p => p.odId === odId) ?? null;
  }

  getStoredName(): string {
    return localStorage.getItem('userName') ?? '';
  }
}

