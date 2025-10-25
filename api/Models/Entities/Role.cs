using System;

namespace Api.Models.Entities
{
    /// <summary>
    /// Defines the roles supported by the application.  While the
    /// database will store an integer or string representation, using
    /// an enum in code makes role checks type safe.  These values
    /// correspond to the roles defined in the design specification: 1
    /// = Admin, 2 = Teacher, 3 = Student.
    /// </summary>
    public enum Role
    {
        Admin = 1,
        Teacher = 2,
        Student = 3
    }
}