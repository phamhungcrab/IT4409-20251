using System.ComponentModel.DataAnnotations;

namespace OnlineExam.Application.Dtos.AnnouncementDtos
{
    /// <summary>
    /// DTO để Teacher tạo thông báo mới.
    /// </summary>
    public class CreateAnnouncementDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Loại thông báo: info, warning, success, error.
        /// </summary>
        public string Type { get; set; } = "info";

        /// <summary>
        /// ID của lớp nhận thông báo.
        /// </summary>
        [Required]
        public int ClassId { get; set; }
    }
}
