using Microsoft.EntityFrameworkCore;
using OnlineExam.Application.Dtos.AnnouncementDtos;
using OnlineExam.Application.Dtos.ResponseDtos;
using OnlineExam.Application.Interfaces;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Enums;
using OnlineExam.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineExam.Application.Services
{
    /// <summary>
    /// Service xử lý logic liên quan đến thông báo.
    /// </summary>
    public class AnnouncementService : IAnnouncementService
    {
        private readonly IRepository<Announcement> _announcementRepo;
        private readonly IRepository<StudentAnnouncement> _studentAnnouncementRepo;
        private readonly IRepository<StudentClass> _studentClassRepo;
        private readonly IRepository<Class> _classRepo;

        public AnnouncementService(
            IRepository<Announcement> announcementRepo,
            IRepository<StudentAnnouncement> studentAnnouncementRepo,
            IRepository<StudentClass> studentClassRepo,
            IRepository<Class> classRepo)
        {
            _announcementRepo = announcementRepo;
            _studentAnnouncementRepo = studentAnnouncementRepo;
            _studentClassRepo = studentClassRepo;
            _classRepo = classRepo;
        }

        /// <summary>
        /// Teacher tạo thông báo cho sinh viên trong lớp.
        /// Tự động tạo StudentAnnouncement cho mỗi sinh viên trong class.
        /// </summary>
        public async Task<ResultApiModel> CreateAsync(CreateAnnouncementDto dto, int teacherId)
        {
            // Kiểm tra class tồn tại
            var classEntity = await _classRepo.GetByIdAsync(dto.ClassId);
            if (classEntity == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy lớp học"
                };
            }

            // Tạo announcement
            var announcement = new Announcement
            {
                Title = dto.Title,
                Content = dto.Content,
                Type = dto.Type,
                ClassId = dto.ClassId,
                CreatedBy = teacherId,
                CreatedAt = DateTime.UtcNow
            };

            await _announcementRepo.AddAsync(announcement);
            await _announcementRepo.SaveChangesAsync(); // Lưu để có announcement.Id

            // Lấy danh sách sinh viên trong lớp
            var studentClasses = await _studentClassRepo.FindAsync(sc => sc.ClassId == dto.ClassId);

            // Tạo StudentAnnouncement cho mỗi sinh viên
            foreach (var sc in studentClasses)
            {
                var studentAnnouncement = new StudentAnnouncement
                {
                    StudentId = sc.StudentId,
                    AnnouncementId = announcement.Id,
                    IsDismissed = false,
                    IsRead = false
                };
                await _studentAnnouncementRepo.AddAsync(studentAnnouncement);
            }
            await _studentAnnouncementRepo.SaveChangesAsync(); // Lưu StudentAnnouncements

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = new AnnouncementDto(announcement)
            };
        }

        /// <summary>
        /// Lấy tất cả thông báo của sinh viên (từ các lớp đang học).
        /// </summary>
        public async Task<ResultApiModel> GetForStudentAsync(int studentId)
        {
            // Lấy danh sách StudentAnnouncement của student
            var studentAnnouncements = await _studentAnnouncementRepo
                .FindAsync(sa => sa.StudentId == studentId, "Announcement", "Announcement.Class");

            // Map sang DTO
            var announcements = studentAnnouncements
                .Where(sa => sa.Announcement != null)
                .OrderByDescending(sa => sa.Announcement!.CreatedAt)
                .Select(sa => new AnnouncementDto(sa.Announcement!, sa))
                .ToList();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = announcements
            };
        }

        /// <summary>
        /// Đánh dấu banner đã hiển thị (không hiện lại nữa).
        /// </summary>
        public async Task<ResultApiModel> DismissAsync(int announcementId, int studentId)
        {
            var studentAnnouncements = await _studentAnnouncementRepo
                .FindAsync(sa => sa.StudentId == studentId && sa.AnnouncementId == announcementId);

            var studentAnnouncement = studentAnnouncements.FirstOrDefault();

            if (studentAnnouncement == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy thông báo"
                };
            }

            studentAnnouncement.IsDismissed = true;
            _studentAnnouncementRepo.UpdateAsync(studentAnnouncement);
            await _studentAnnouncementRepo.SaveChangesAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = true
            };
        }

        /// <summary>
        /// Đánh dấu đã đọc (khi click vào thông báo trong dropdown chuông).
        /// </summary>
        public async Task<ResultApiModel> MarkAsReadAsync(int announcementId, int studentId)
        {
            var studentAnnouncements = await _studentAnnouncementRepo
                .FindAsync(sa => sa.StudentId == studentId && sa.AnnouncementId == announcementId);

            var studentAnnouncement = studentAnnouncements.FirstOrDefault();

            if (studentAnnouncement == null)
            {
                return new ResultApiModel
                {
                    Status = false,
                    MessageCode = ResponseCode.NotFound,
                    Data = "Không tìm thấy thông báo"
                };
            }

            studentAnnouncement.IsRead = true;
            studentAnnouncement.ReadAt = DateTime.UtcNow;
            _studentAnnouncementRepo.UpdateAsync(studentAnnouncement);
            await _studentAnnouncementRepo.SaveChangesAsync();

            return new ResultApiModel
            {
                Status = true,
                MessageCode = ResponseCode.Success,
                Data = true
            };
        }
    }
}
