import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  receiptOutline,
  cubeOutline,
  warningOutline,
  alertCircleOutline,
  timeOutline,
} from 'ionicons/icons';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonIcon,
  ],
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);

  readonly pharmacyName = () => this.authService.getCurrentUser()?.pharmacyName ?? '';
  readonly userName = () => this.authService.getCurrentUser()?.fullName ?? '';

  constructor() {
    addIcons({ cashOutline, receiptOutline, cubeOutline, warningOutline, alertCircleOutline, timeOutline });
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(event?: CustomEvent): void {
    this.loading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
        (event?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
      error: () => {
        this.loading.set(false);
        (event?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
    });
  }

  onRefresh(event: CustomEvent): void {
    this.loadStats(event);
  }
}
