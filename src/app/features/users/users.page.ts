import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, personOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { UserManagementService } from '../../core/services/user-management.service';
import { StaffUser } from '../../core/models/user-management.model';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class UsersPage implements OnInit {
  private readonly userManagementService = inject(UserManagementService);
  private readonly router = inject(Router);

  readonly users = signal<StaffUser[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term)
    );
  });

  constructor() {
    addIcons({ addOutline, personOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userManagementService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addUser(): void {
    this.router.navigate(['/tabs/users/new']);
  }

  openUser(user: StaffUser): void {
    this.router.navigate(['/tabs/users', user.id, 'edit'], { state: { user } });
  }
}
