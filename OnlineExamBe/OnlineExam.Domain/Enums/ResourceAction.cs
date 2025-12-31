using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Enums
{
    
    public enum ResourceAction
    {

        View,
        ViewDetail,
        Edit,
        Delete,
        Create,
        CreateExam,
        Submit, // svien nop bai
        AddMenber, // them thanh vien vao lop hay vao nhom co the thi
        Logout,
    }
}
