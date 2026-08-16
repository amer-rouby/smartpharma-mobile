export interface NotificationSettings {
  id?: number;
  userId?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  preferredLanguage: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notifyLowStock: boolean;
  notifyOutOfStock: boolean;
  notifyExpiryWarning: boolean;
  notifyExpiredProducts: boolean;
  notifyNewSale: boolean;
  notifyLargeSale: boolean;
  notifyNewExpense: boolean;
  notifyLargeExpense: boolean;
  notifyBackupReminder: boolean;
  notifySecurityAlerts: boolean;
}

export type NotificationSettingsRequest = Partial<NotificationSettings>;
