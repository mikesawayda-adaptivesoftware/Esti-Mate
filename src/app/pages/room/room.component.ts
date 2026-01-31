import { Component, OnInit, OnDestroy, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { VotingCardComponent } from '../../components/voting-card/voting-card.component';
import { ParticipantCardComponent } from '../../components/participant-card/participant-card.component';
import { CelebrationOverlayComponent } from '../../components/celebration-overlay/celebration-overlay.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VotingCardComponent,
    ParticipantCardComponent,
    CelebrationOverlayComponent
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {
  // Inject services using inject() function
  readonly roomService = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly fibonacciValues = ['1', '2', '3', '5', '8', '13', '21', '?'];
  
  showJoinModal = signal(false);
  userName = signal('');
  topicInput = signal('');
  copySuccess = signal(false);
  isRevealing = signal(false);
  isResetting = signal(false);

  // Computed values from room service
  readonly room = this.roomService.currentRoom;
  readonly participants = this.roomService.participants;
  readonly isLoading = this.roomService.isLoading;
  readonly hasConsensus = this.roomService.hasConsensus;
  readonly consensusValue = this.roomService.consensusValue;
  readonly allVoted = this.roomService.allVoted;

  readonly currentParticipant = computed(() => {
    return this.roomService.getCurrentParticipant();
  });

  readonly currentVote = computed(() => {
    return this.currentParticipant()?.vote ?? null;
  });

  readonly participantCount = computed(() => {
    return this.participants().length;
  });

  readonly votedCount = computed(() => {
    return this.participants().filter(p => p.vote !== null).length;
  });

  private roomId: string | null = null;

  constructor() {
    // Effect to update topic input when room changes
    effect(() => {
      const room = this.room();
      if (room?.currentTopic) {
        this.topicInput.set(room.currentTopic);
      }
    });
  }

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    
    if (!this.roomId) {
      this.router.navigate(['/']);
      return;
    }

    // Check if user needs to join
    const storedName = this.roomService.getStoredName();
    const participantId = sessionStorage.getItem('participantId');

    if (storedName && participantId) {
      this.userName.set(storedName);
      this.roomService.joinRoom(this.roomId, storedName);
    } else {
      this.showJoinModal.set(true);
      if (storedName) {
        this.userName.set(storedName);
      }
    }
  }

  ngOnDestroy(): void {
    // Don't unsubscribe - keep the connection alive for returning
    // this.roomService.unsubscribeFromRoom();
  }

  async joinRoom(): Promise<void> {
    if (!this.userName().trim() || !this.roomId) return;

    try {
      await this.roomService.joinRoom(this.roomId, this.userName().trim());
      this.showJoinModal.set(false);
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  }

  async selectCard(value: string): Promise<void> {
    const room = this.room();
    if (room?.revealed) return;
    
    await this.roomService.vote(value);
  }

  async revealVotes(): Promise<void> {
    this.isRevealing.set(true);
    try {
      await this.roomService.revealVotes();
    } finally {
      this.isRevealing.set(false);
    }
  }

  async resetVotes(): Promise<void> {
    this.isResetting.set(true);
    try {
      await this.roomService.resetVotes();
    } finally {
      this.isResetting.set(false);
    }
  }

  async updateTopic(): Promise<void> {
    await this.roomService.updateTopic(this.topicInput());
  }

  updateTopicInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.topicInput.set(input.value);
  }

  updateUserName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userName.set(input.value);
  }

  async copyRoomLink(): Promise<void> {
    const room = this.room();
    if (!room) return;

    const url = `${window.location.origin}/room/${room.id}`;
    const textToCopy = `Join my Esti-Mate room!\nCode: ${room.code}\nLink: ${url}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }
  }

  leaveRoom(): void {
    this.roomService.leaveRoom();
    this.router.navigate(['/']);
  }

  isCurrentUser(odId: string): boolean {
    return this.roomService.currentParticipantId() === odId;
  }

  getVoteAverage(): string {
    const participants = this.participants();
    const numericVotes = participants
      .map(p => p.vote)
      .filter(v => v !== null && v !== '?' && !isNaN(Number(v)))
      .map(v => Number(v));

    if (numericVotes.length === 0) return '—';
    
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    return avg.toFixed(1);
  }
}

