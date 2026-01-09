using OnlineExam.Application.Dtos.AnnouncementDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using System.Threading.Tasks;

namespace OnlineExam.Application.Interfaces
{
    /// <summary>
    /// Service xử lý logic liên quan đến thông báo.
    /// </summary>
    public interface IAnnouncementService
    {
        /// <summary>
        /// Teacher tạo thông báo cho sinh viên trong lớp.
        /// Tự động tạo StudentAnnouncement cho mỗi sinh viên trong class.
        /// </summary>
        Task<ResultApiModel> CreateAsync(CreateAnnouncementDto dto, int teacherId);

        /// <summary>
        /// Lấy tất cả thông báo của sinh viên (từ các lớp đang học).
        /// </summary>
        Task<ResultApiModel> GetForStudentAsync(int studentId);

        /// <summary>
        /// Đánh dấu banner đã hiển thị (không hiện lại nữa).
        /// Gọi khi banner biến mất sau progress bar.
        /// </summary>
        Task<ResultApiModel> DismissAsync(int announcementId, int studentId);

        /// <summary>
        /// Đánh dấu đã đọc (khi click vào thông báo trong dropdown chuông).
        /// </summary>
        Task<ResultApiModel> MarkAsReadAsync(int announcementId, int studentId);
    }
}
