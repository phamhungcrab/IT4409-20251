import apiClient from '../utils/apiClient';

/**
 * AnnouncementDto: Thông báo từ backend.
 */
export interface AnnouncementDto {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  isDismissed: boolean;
  isRead: boolean;
  classId: number;
  className?: string;
}

/**
 * CreateAnnouncementDto: Dữ liệu tạo thông báo mới.
 */
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  classId: number;
}

/**
 * announcementService: API service cho thông báo.
 */
export const announcementService = {
  /**
   * Lấy danh sách thông báo của student hiện tại.
   */
  getForStudent: async (): Promise<AnnouncementDto[]> => {
    return await apiClient.get<AnnouncementDto[]>('/api/Announcement/student') as unknown as AnnouncementDto[];
  },

  /**
   * Đánh dấu banner đã hiển thị (không hiện lại nữa).
   * Gọi khi banner biến mất sau progress bar.
   */
  dismiss: async (id: number): Promise<void> => {
    await apiClient.put(`/api/Announcement/dismiss/${id}`);
  },

  /**
   * Đánh dấu đã đọc (khi click vào thông báo trong dropdown chuông).
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/api/Announcement/mark-read/${id}`);
  },

  /**
   * Teacher tạo thông báo mới cho lớp.
   */
  create: async (dto: CreateAnnouncementDto): Promise<AnnouncementDto> => {
    return await apiClient.post<AnnouncementDto>('/api/Announcement/create', dto) as unknown as AnnouncementDto;
  },
};
