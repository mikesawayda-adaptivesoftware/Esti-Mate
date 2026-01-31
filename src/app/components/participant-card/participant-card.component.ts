import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Participant } from '../../models/participant.model';

@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.scss'
})
export class ParticipantCardComponent {
  @Input() participant!: Participant;
  @Input() revealed = false;
  @Input() isCurrentUser = false;
}

