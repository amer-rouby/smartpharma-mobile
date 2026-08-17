import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ReportService } from '../../../core/services/report.service';
import { FinancialReportResponse } from '../../../core/models/report.model';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-report.page.html',
  styleUrls: ['../report-shared.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonSpinner,
  ],
})
export class FinancialReportPage implements OnInit {
  private readonly reportService = inject(ReportService);

  readonly loading = signal(true);
  readonly report = signal<FinancialReportResponse | null>(null);
  readonly startDate = signal(this.daysAgo(90));
  readonly endDate = signal(this.daysAgo(0));

  private daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportService.getFinancial(this.startDate(), this.endDate()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
