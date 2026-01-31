import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voting-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voting-card.component.html',
  styleUrl: './voting-card.component.scss'
})
export class VotingCardComponent {
  @Input() value!: string;
  @Input() isSelected = false;
  @Input() disabled = false;
  @Output() selected = new EventEmitter<string>();

  onClick(): void {
    if (!this.disabled) {
      this.selected.emit(this.value);
    }
  }
}

