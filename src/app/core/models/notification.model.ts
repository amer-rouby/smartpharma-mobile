export interface NotificationModel {
  id: number;
  title: string;
  message: string;
  titleEn?: string;
  messageEn?: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}
