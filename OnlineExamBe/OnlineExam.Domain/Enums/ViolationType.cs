using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Enums
{
    public enum ViolationType
    {
        FOCUS_LOSS,       // Tab switching, window blur
        FULLSCREEN_EXIT   // Exiting fullscreen mode
    }
}
