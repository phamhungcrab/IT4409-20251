using OnlineExam.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Application.Dtos.UserDtos
{
    public class SearchForAdminDto : SearchBaseDto
    {
        public string? FullName { get; set; } = null;
        public DateTime? DobFrom { get; set; } = null;
        public DateTime? DobTo { get; set; } = null;
        public string? MSSV { get; set; } = null;
        [EmailAddress]
        public string? Email { get; set; } = null;

        public UserRole? Role { get; set; } = null;
    }
}
