import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, cubeOutline, trendingUpOutline, timeOutline, chevronBackOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [CommonModule, TranslateModule, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
})
export class ReportsPage {
  private readonly router = inject(Router);

  constructor() {
    addIcons({ cashOutline, cubeOutline, trendingUpOutline, timeOutline, chevronBackOutline });
  }

  goTo(path: string): void {
    this.router.navigate([`/tabs/reports/${path}`]);
  }
}
