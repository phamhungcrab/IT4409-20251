using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineExam.Domain.Enums
{
    /// <summary>
    /// Fabcd
    ///ab la mã GroupPermission
    ///c là role có thể thực hiện
    /// (0 - admin )
    ///1 - teacher
    ///2-student
    /// 3-proctor
    ///4-assitant
    ///d là hành động CRUD
    /// 1 - C
    ///2- R
    ///3 - U
    ///4 - D
    /// </summary>
    public enum PermissionCode
    {
       
        //F01
        /// <summary>
        /// Ma dac biet cho phep moi nguoi truy cap
        /// </summary>
        F0000,
        /// <summary>
        /// xem thong tin lop cho nhung nguoi quan ly
        /// </summary>
        F0112 ,
        /// <summary>
        /// chinh sua thong tin lop
        /// </summary>
        F0113,
        /// <summary>
        /// xoa lop
        /// </summary>
        F0114,

        //F02
        /// <summary>
        /// tim kiem user khac
        /// </summary>
        F0222,
        /// <summary>
        /// update thong tin cho user
        /// </summary>
        F0223,
        /// <summary>
        /// xoa user
        /// </summary>
        F0224,
        /// <summary>
        /// tao user
        /// </summary>
        F0221,

        //F03
        /// <summary>
        /// xem mon hoc
        /// </summary>
        F0322,
        /// <summary>
        /// thay doi thong tin mon
        /// </summary>
        F0313,
        /// <summary>
        /// Tao mon hoc
        /// </summary>
        F0311,
        /// <summary>
        /// Xoa mon hoc
        /// </summary>
        F0314,

        //F04
        /// <summary>
        /// tao cau hoi
        /// </summary>
        F0411,
        /// <summary>
        /// lay cau hoi
        /// </summary>
        F0422,
        /// <summary>
        /// cap nhat cau hoi
        /// </summary>
        F0413,
        /// <summary>
        /// xoa cau hoi
        /// </summary>
        F0414,

        //F05
        /// <summary>
        /// xem exam/ bai thi
        /// </summary>
        F0522,
        /// <summary>
        /// cap nhat exam/bai thi
        /// </summary>
        F0513,
        /// <summary>
        /// xoa exam/bai thi
        /// </summary>
        F0514,
        /// <summary>
        /// tao exam/bai thi
        /// </summary>
        F0511,

        







    }
}
