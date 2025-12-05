/**
 * HomePage component.
 *
 * This page serves as the landing page for authenticated users.
 * For Students: Displays announcements, upcoming exams, and results.
 * For Teachers: Displays a dashboard to manage classes, students, and create exams.
 */

import React, { useState, useEffect } from 'react';
import AnnouncementBanner, { Announcement } from '../components/AnnouncementBanner';
import ResultTable, { ResultItem } from '../components/ResultTable';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../services/authService';
import { classService, ClassDto } from '../services/classService';
import { examService } from '../services/examService';

interface UpcomingExam {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // State for everyone
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // State for students
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);

  // State for teachers
  const [teacherClasses, setTeacherClasses] = useState<ClassDto[]>([]);
  const [selectedClassStudents, setSelectedClassStudents] = useState<StudentDto[]>([]);
  const [viewingClassId, setViewingClassId] = useState<number | null>(null);

  useEffect(() => {
    // Determine view and fetch appropriate mock/real data
    if (user?.role === UserRole.Student || !user) {
        // Sample announcements for students
        setAnnouncements([
          { id: 1, message: 'Welcome to the Online Examination System!', type: 'success' },
          { id: 2, message: 'Don\'t forget to check your upcoming exams below.', type: 'info' }
        ]);

        // Sample upcoming exams (Student View)
        setUpcomingExams([
          {
            id: 101,
            title: 'Mathematics Midterm',
            startTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            endTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000) // + 90 min
          },
          {
            id: 102,
            title: 'History Quiz',
            startTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
          }
        ]);

        // Sample results (Student View)
        setResults([
          {
            id: 201,
            examTitle: 'Science Test',
            objectiveScore: 8.5,
            subjectiveScore: 7.5,
            totalScore: 16.0,
            status: 'Completed'
          },
          {
            id: 202,
            examTitle: 'English Placement',
            objectiveScore: 9.0,
            subjectiveScore: 8.0,
            totalScore: 17.0,
            status: 'Completed'
          }
        ]);
    } else if (user?.role === UserRole.Teacher) {
        // Teacher specific init
        setAnnouncements([]); // Clear student announcements if any
    }
  }, [user]);

  // Fetch teacher data when user is confirmed as Teacher
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (user?.role === UserRole.Teacher && user.id) {
        try {
          // Fetch classes for this teacher
          const classes = await classService.getByTeacherAndSubject(user.id);
          setTeacherClasses(classes);
        } catch (error) {
          console.error('Failed to fetch teacher classes', error);
        }
      }
    };
    fetchTeacherData();
  }, [user]);

  const handleViewStudents = async (classId: number) => {
    try {
      setViewingClassId(classId);
      const students = await classService.getStudentsByClass(classId);
      setSelectedClassStudents(students);
    } catch (error) {
      console.error('Failed to fetch students', error);
      alert('Failed to load students.');
    }
  };

  const handleCreateExam = async (classId: number) => {
    const examName = prompt("Enter exam name:");
    if (!examName) return;

    const durationStr = prompt("Enter duration (minutes):", "60");
    const duration = parseInt(durationStr || "60", 10);

    // MOCK: In real app, open a modal with full form
    try {
        await examService.createExam({
            name: examName,
            classId: classId,
            blueprintId: 1, // Default blueprint (assuming seed data exists)
            durationMinutes: duration,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        alert("Exam created successfully!");
    } catch (err) {
        alert("Failed to create exam. Backend might require specific Blueprint ID.");
        console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {user?.role === UserRole.Teacher ? (
        // ================= TEACHER DASHBOARD =================
        <div className="space-y-6">
           <div>
             <h1 className="text-3xl font-semibold text-white">Teacher Dashboard</h1>
             <p className="text-slate-300">Manage your classes and exams</p>
           </div>

           <div className="grid gap-6 md:grid-cols-2">
             {/* Class List */}
             <div className="glass-card p-5">
               <h2 className="text-xl font-semibold text-white mb-4">Your Classes</h2>
               {teacherClasses.length === 0 ? (
                 <p className="text-slate-400">No classes assigned.</p>
               ) : (
                 <ul className="space-y-3">
                   {teacherClasses.map(cls => (
                     <li key={cls.id} className="panel p-3 flex justify-between items-center bg-white/5 rounded-lg border border-white/10">
                       <div>
                         <p className="font-medium text-white">{cls.name}</p>
                         <p className="text-xs text-slate-400">Subject ID: {cls.subjectId}</p>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => handleViewStudents(cls.id)}
                           className="btn btn-ghost text-xs px-2 py-1 border border-white/20 hover:bg-white/10"
                         >
                           View Users
                         </button>
                         <button
                            onClick={() => handleCreateExam(cls.id)}
                            className="btn btn-primary text-xs px-2 py-1"
                         >
                           + Create Exam
                         </button>
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
             </div>

             {/* Students List */}
             <div className="glass-card p-5">
               <h2 className="text-xl font-semibold text-white mb-4">
                 {viewingClassId ? `Students in Class #${viewingClassId}` : 'Select a class to view students'}
               </h2>
               {viewingClassId && (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-slate-300">
                       <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                         <tr>
                            <th className="py-2">ID/MSSV</th>
                            <th className="py-2">Name</th>
                            <th className="py-2">Email</th>
                         </tr>
                       </thead>
                       <tbody>
                         {selectedClassStudents.map(student => (
                           <tr key={student.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                             <td className="py-2">{student.mssv || student.id}</td>
                             <td className="py-2">{student.fullName || 'N/A'}</td>
                             <td className="py-2">{student.email}</td>
                           </tr>
                         ))}
                         {selectedClassStudents.length === 0 && (
                            <tr><td colSpan={3} className="py-4 text-center text-slate-500">No students found.</td></tr>
                         )}
                       </tbody>
                     </table>
                   </div>
               )}
             </div>
           </div>
        </div>
      ) : (
        // ================= STUDENT DASHBOARD =================
        <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">Welcome back</p>
                <h1 className="text-3xl font-semibold text-white mt-1">Your exam cockpit</h1>
                <p className="text-sm text-slate-300 mt-2">
                    Track announcements, upcoming exams, and results in a single, calm space.
                </p>
                </div>
                <div className="glass-card px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-semibold">
                    {upcomingExams.length}
                </div>
                <div>
                    <p className="text-xs text-slate-300">Upcoming exams</p>
                    <p className="text-lg font-semibold text-white">{upcomingExams.length > 0 ? 'Ready to go' : 'All clear'}</p>
                </div>
                </div>
            </div>

            <AnnouncementBanner announcements={announcements} />

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <p className="text-sm text-slate-300">Schedule</p>
                    <h2 className="text-xl font-semibold text-white">Upcoming Exams</h2>
                    </div>
                    <span className="tag">
                    <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                    Live
                    </span>
                </div>
                {upcomingExams.length > 0 ? (
                    <ul className="space-y-3">
                    {upcomingExams.map((exam) => (
                        <li
                        key={exam.id}
                        className="panel p-4 flex items-start gap-3 hover:border-white/30"
                        >
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500/20 text-white font-semibold">
                            {exam.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                            <p className="text-sm text-slate-300">
                            Starts: {exam.startTime.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-300">
                            Ends: {exam.endTime.toLocaleString()}
                            </p>
                        </div>
                        {/* Fix: use /exam/:id route */}
                        <Link to={`/exam/${exam.id}`} className="btn btn-primary text-sm">
                            Enter
                        </Link>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-slate-300">You have no upcoming exams at this time.</p>
                )}
                </div>

                <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <p className="text-sm text-slate-300">Performance</p>
                    <h2 className="text-xl font-semibold text-white">Recent Results</h2>
                    </div>
                    <span className="tag">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    Updated
                    </span>
                </div>
                <ResultTable results={results} />
                </div>
            </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
