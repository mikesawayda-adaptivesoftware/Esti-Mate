import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  userName = signal('');
  roomCode = signal('');
  isCreating = signal(false);
  isJoining = signal(false);
  errorMessage = signal('');

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {
    // Load stored name if exists
    const storedName = this.roomService.getStoredName();
    if (storedName) {
      this.userName.set(storedName);
    }
  }

  async createRoom(): Promise<void> {
    if (!this.userName().trim()) {
      this.errorMessage.set('Please enter your name');
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set('');

    try {
      const roomId = await this.roomService.createRoom();
      await this.roomService.joinRoom(roomId, this.userName().trim());
      this.router.navigate(['/room', roomId]);
    } catch (err) {
      this.errorMessage.set('Failed to create room. Please try again.');
      console.error(err);
    } finally {
      this.isCreating.set(false);
    }
  }

  async joinRoom(): Promise<void> {
    if (!this.userName().trim()) {
      this.errorMessage.set('Please enter your name');
      return;
    }

    if (!this.roomCode().trim()) {
      this.errorMessage.set('Please enter a room code');
      return;
    }

    this.isJoining.set(true);
    this.errorMessage.set('');

    try {
      const roomId = await this.roomService.findRoomByCode(this.roomCode().trim());
      
      if (!roomId) {
        this.errorMessage.set('Room not found. Please check the code.');
        return;
      }

      await this.roomService.joinRoom(roomId, this.userName().trim());
      this.router.navigate(['/room', roomId]);
    } catch (err) {
      this.errorMessage.set('Failed to join room. Please try again.');
      console.error(err);
    } finally {
      this.isJoining.set(false);
    }
  }

  updateName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userName.set(input.value);
  }

  updateRoomCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.roomCode.set(input.value.toUpperCase());
  }
}

