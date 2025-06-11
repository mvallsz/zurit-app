import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger40ms } from 'src/@vex/animations/stagger.animation';
import { Project } from '../../models/project.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'zurit-projects-card',
  templateUrl: './projects-card.component.html',
  styleUrls: ['./projects-card.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class ProjectsCardComponent implements OnInit {
  @Input() project: Project;
  @Output() openProject = new EventEmitter<Project['_id']>();
  @Output() toggleStar = new EventEmitter<Project['_id']>();

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {}

  emitToggleStar(event: MouseEvent, projectId: Project['_id']) {
    event.stopPropagation();
    this.toggleStar.emit(projectId);
  }

  copyToClipboard(text: string): void {
    if (!text) {
      this.snackBar.open('No hay información para copiar', 'Cerrar', { duration: 2000 });
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        this.snackBar.open('Copiado al portapapeles', 'Cerrar', { duration: 2000 });
      },
      (err) => {
        console.error('Error al copiar al portapapeles: ', err);
        this.snackBar.open('Error al copiar al portapapeles', 'Cerrar', { duration: 2000 });
      }
    );
  }
}
