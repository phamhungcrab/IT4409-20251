import { classService, ClassDto } from './classService';
import { examService, ExamStudentStatus } from './examService';
import { blueprintService } from './blueprintService';
import { parseUtcDate } from '../utils/dateUtils';

/**
 * Các interface cho Dashboard Data
 */

export interface ActionItem {
  id: string; // Unique ID composed of type + related ID
  priority: 'high' | 'medium' | 'low';
  type: 'ungraded' | 'upcoming' | 'missing_students' | 'missing_blueprint';
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  count?: number;
  date?: string;
  classId?: number;
}

export interface ExamMonitorItem {
  id: number;
  name: string;
  className: string;
  classId: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'ended';
  studentsTotal: number;
  studentsCompleted: number; // Tạm thời mock hoặc tính toán nếu có API
}

export interface ClassSpotlightItem {
  id: number;
  name: string;
  studentCount: number;
  examCount: number;
  alert?: {
    type: 'ungraded' | 'upcoming' | 'missing_students' | 'missing_blueprint';
    count?: number;
    text: string;
  };
  nextExam?: string;
}

export interface TeacherDashboardData {
  overview: {
    totalClasses: number;
    totalStudents: number;
    totalExams: number;
    pendingGrading: number;
  };
  actionItems: ActionItem[];
  examMonitor: {
    upcoming: ExamMonitorItem[];
    live: ExamMonitorItem[];
  };
  classSpotlight: ClassSpotlightItem[];
  classes: ClassDto[];
}

/**
 * Dashboard Service - Aggregates data from other services to populate the dashboard without new backend APIs.
 */
export const dashboardService = {
  /**
   * Lấy toàn bộ dữ liệu cho dashboard
   * @param teacherId ID của giáo viên
   */
  getTeacherDashboardData: async (teacherId: number): Promise<TeacherDashboardData> => {
    try {
      // 1. Lấy danh sách lớp của giáo viên
      const classes = await classService.getByTeacherAndSubject(teacherId);

      // 2. Fetch chi tiết cho từng lớp để có đầy đủ thông tin (blueprint, exams, students)
      // Dùng Promise.allSettled để tránh fail toàn bộ nếu 1 request lỗi
      const classDetailsPromises = classes.map(async (c) => {
        try {
            // Lấy chi tiết lớp để có blueprints (theo subjectId của lớp)
            const blueprints = await blueprintService.getBySubjectId(c.subjectId).catch(() => []);

            // Lấy danh sách SV để đếm (nếu API getByTeacher chưa trả về studentCount)
            // Lưu ý: Có thể tối ưu bằng cách chỉ gọi số lượng nếu backend hỗ trợ,
            // hiện tại gọi getAll SV hơi nặng nếu lớp đông, nhưng chấp nhận được với quy mô nhỏ.
            const students = await classService.getStudentsByClass(c.id).catch(() => []);

            return {
                ...c,
                studentCount: students.length,
                blueprints: blueprints || [],
                exams: c.exams || [] // API getByTeacher thường đã trả về exams
            };
        } catch (e) {
            return { ...c, studentCount: 0, blueprints: [], exams: c.exams || [] };
        }
      });

      const processedClasses = await Promise.all(classDetailsPromises);

      // 3. Process Data
      return processDashboardData(processedClasses);

    } catch (error) {
      console.error("Dashboard data aggregation failed:", error);
      // Trả về dữ liệu rỗng/mặc định khi lỗi
      return {
        overview: { totalClasses: 0, totalStudents: 0, totalExams: 0, pendingGrading: 0 },
        actionItems: [],
        examMonitor: { upcoming: [], live: [] },
        classSpotlight: [],
        classes: []
      };
    }
  }
};

/**
 * Helper function: Xử lý raw data thành dashboard data format
 */
const processDashboardData = (classes: any[]): TeacherDashboardData => {
  let totalStudents = 0;
  let totalExams = 0;
  let actionItems: ActionItem[] = [];
  let upcomingExams: ExamMonitorItem[] = [];
  let liveExams: ExamMonitorItem[] = [];
  let spotlightCandidates: any[] = []; // Để sort và chọn top 3

  const now = new Date();

  classes.forEach(c => {
    totalStudents += c.studentCount || 0;
    totalExams += c.exams?.length || 0;

    // --- ANALYZE CLASS ALERTS ---
    let classAlertPriority = 0; // Để sort spotlight
    let alertInfo = undefined;

    // 1. Check Missing Students
    if (!c.studentCount || c.studentCount === 0) {
      actionItems.push({
        id: `missing_students_${c.id}`,
        priority: 'low',
        type: 'missing_students',
        title: `Lớp ${c.name} - Chưa có sinh viên`,
        subtitle: 'Cần import danh sách sinh viên',
        ctaLabel: 'Thêm SV',
        ctaLink: `/class/${c.id}?tab=students`,
        classId: c.id
      });
      classAlertPriority += 1;
    }

    // 2. Check Missing Blueprint (chỉ check nếu đã có SV mà chưa có cấu trúc đề)
    if (c.studentCount > 0 && (!c.blueprints || c.blueprints.length === 0)) {
      actionItems.push({
        id: `missing_blueprint_${c.id}`,
        priority: 'low',
        type: 'missing_blueprint',
        title: `Lớp ${c.name} - Thiếu cấu trúc đề`,
        subtitle: 'Cần tạo blueprint để tạo đề thi',
        ctaLabel: 'Tạo',
        ctaLink: `/class/${c.id}?tab=blueprints`,
        classId: c.id
      });
      // Blueprint quan trọng vừa phải
      if (classAlertPriority < 2) classAlertPriority = 2;
    }

    // 3. Analyze Exams
    if (c.exams && c.exams.length > 0) {
      c.exams.forEach((ex: any) => {
        const start = parseUtcDate(ex.startTime);
        const end = parseUtcDate(ex.endTime);
        const isUpcoming = start && start > now;
        const isLive = start && end && start <= now && end >= now;

        // Exam Monitor
        if (isUpcoming || isLive) {
            const monitorItem: ExamMonitorItem = {
                id: ex.id,
                name: ex.name,
                className: c.name,
                classId: c.id,
                startTime: ex.startTime,
                endTime: ex.endTime,
                status: isLive ? 'live' : 'upcoming',
                studentsTotal: c.studentCount,
                studentsCompleted: 0 // TODO: Cần gọi thêm API status nếu muốn chính xác số đã nộp
            };

            if (isLive) {
                liveExams.push(monitorItem);
                // Live exam là ưu tiên cao nhất cho spotlight
                classAlertPriority = 10;
                alertInfo = { type: 'upcoming', text: 'Đang diễn ra thi' };
            } else {
                upcomingExams.push(monitorItem);

                // Check if upcoming in next 24h -> High Priority Action Item
                const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (hoursUntil > 0 && hoursUntil <= 24) {
                    actionItems.push({
                        id: `upcoming_exam_${ex.id}`,
                        priority: hoursUntil <= 2 ? 'high' : 'medium',
                        type: 'upcoming',
                        title: `${c.name} - ${ex.name}`,
                        subtitle: `Bắt đầu lúc ${start.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`,
                        ctaLabel: 'Chi tiết',
                        ctaLink: `/class/${c.id}?tab=exams`,
                        count: c.studentCount,
                        date: ex.startTime
                    });
                     if (classAlertPriority < 5) {
                        classAlertPriority = 5;
                        alertInfo = { type: 'upcoming', text: `Thi lúc ${start.getHours()}:${start.getMinutes()}` };
                     }
                }
            }
        }
      });
    }

    // Add to spotlight candidates
    spotlightCandidates.push({
        ...c,
        priority: classAlertPriority,
        alert: alertInfo,
        // Tìm exam gần nhất
        nextExam: c.exams?.map((e:any) => e.startTime).filter((t:string) => new Date(t) > now).sort()[0]
    });

  });

  // Sort Action Items: High -> Medium -> Low
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
  actionItems.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  // Sort & Select Top 3 Spotlight
  const topClasses = spotlightCandidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map(c => ({
        id: c.id,
        name: c.name,
        studentCount: c.studentCount,
        examCount: c.exams?.length || 0,
        alert: c.alert,
        nextExam: c.nextExam
    }));

  return {
    overview: {
      totalClasses: classes.length,
      totalStudents,
      totalExams,
      pendingGrading: 0 // Mock: Chưa có API lấy số lượng chưa chấm
    },
    actionItems: actionItems.slice(0, 5), // Chỉ lấy 5 item quan trọng nhất
    examMonitor: {
      upcoming: upcomingExams.sort((a, b) => (parseUtcDate(a.startTime)?.getTime() ?? 0) - (parseUtcDate(b.startTime)?.getTime() ?? 0)).slice(0, 5),
      live: liveExams.sort((a, b) => (parseUtcDate(a.endTime)?.getTime() ?? 0) - (parseUtcDate(b.endTime)?.getTime() ?? 0))
    },
    classSpotlight: topClasses,
    classes: classes // Return full classes list specifically for search & directory
  };
};
