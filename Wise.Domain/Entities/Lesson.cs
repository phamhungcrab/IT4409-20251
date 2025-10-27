using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Wise.Domain.Enums;

namespace Wise.Domain.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";


        
        public LessonType Type { get; set; }   // Reading / Listening / Vocabulary / Writing
        public SkillType Skill { get; set; }
        public DifficultyLevel Difficulty { get; set; }

        public int Level { get; set; } = 1; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
        public ICollection<LearningResult> LearningResults { get; set; } = new List<LearningResult>();
    }
}
