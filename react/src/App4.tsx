import "./App.css";

import React, { useState } from "react";

interface Course {
  id: string;
  name: string;
  professor: string;
  credits: number;
  time: string;
  capacity: number;
  enrolled: number;
}

const App: React.FC = () => {
  // 개설 과목 데이터
  const [availableCourses] = useState<Course[]>([
    {
      id: "CS101",
      name: "프로그래밍 기초",
      professor: "김교수",
      credits: 3,
      time: "월수금 10:00-11:00",
      capacity: 50,
      enrolled: 35,
    },
    {
      id: "CS201",
      name: "자료구조",
      professor: "이교수",
      credits: 3,
      time: "화목 13:00-14:30",
      capacity: 40,
      enrolled: 28,
    },
    {
      id: "CS301",
      name: "데이터베이스",
      professor: "박교수",
      credits: 3,
      time: "월수 15:00-16:30",
      capacity: 35,
      enrolled: 32,
    },
    {
      id: "MATH101",
      name: "미적분학",
      professor: "최교수",
      credits: 3,
      time: "화목금 09:00-10:00",
      capacity: 60,
      enrolled: 45,
    },
    {
      id: "ENG101",
      name: "영어회화",
      professor: "Smith",
      credits: 2,
      time: "월수 11:00-12:00",
      capacity: 25,
      enrolled: 20,
    },
    {
      id: "PHYS101",
      name: "일반물리학",
      professor: "정교수",
      credits: 3,
      time: "화목 10:00-11:30",
      capacity: 45,
      enrolled: 38,
    },
    {
      id: "CHEM101",
      name: "일반화학",
      professor: "한교수",
      credits: 3,
      time: "월수금 14:00-15:00",
      capacity: 40,
      enrolled: 25,
    },
    {
      id: "BIO101",
      name: "생물학개론",
      professor: "윤교수",
      credits: 3,
      time: "화목 16:00-17:30",
      capacity: 30,
      enrolled: 22,
    },
    {
      id: "HIST101",
      name: "한국사",
      professor: "강교수",
      credits: 2,
      time: "금 13:00-15:00",
      capacity: 80,
      enrolled: 60,
    },
    {
      id: "ART101",
      name: "미술의 이해",
      professor: "조교수",
      credits: 2,
      time: "목 15:00-17:00",
      capacity: 20,
      enrolled: 15,
    },
  ]);

  // 신청한 과목들
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([]);

  const MAX_COURSES = 8;

  // 수강신청 함수
  const registerCourse = (course: Course) => {
    if (registeredCourses.length >= MAX_COURSES) {
      alert(`최대 ${MAX_COURSES}개 과목까지만 신청 가능합니다.`);
      return;
    }

    if (registeredCourses.find((c) => c.id === course.id)) {
      alert("이미 신청한 과목입니다.");
      return;
    }

    if (course.enrolled >= course.capacity) {
      alert("수강인원이 초과되었습니다.");
      return;
    }

    setRegisteredCourses([...registeredCourses, course]);
  };

  // 수강신청 취소 함수
  const cancelCourse = (courseId: string) => {
    setRegisteredCourses(registeredCourses.filter((c) => c.id !== courseId));
  };

  // 총 학점 계산
  const totalCredits = registeredCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      textAlign: "center" as const,
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "30px",
      color: "#333",
    },
    statusBox: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px",
      marginBottom: "20px",
    },
    statusTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "15px",
      color: "#555",
    },
    statusInfo: {
      display: "flex",
      gap: "30px",
      fontSize: "14px",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      "@media (max-width: 768px)": {
        gridTemplateColumns: "1fr",
      },
    },
    sectionBox: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "15px",
      color: "#555",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      fontSize: "14px",
    },
    th: {
      textAlign: "left" as const,
      padding: "10px 5px",
      borderBottom: "2px solid #eee",
      fontWeight: "600",
      color: "#666",
    },
    thCenter: {
      textAlign: "center" as const,
      padding: "10px 5px",
      borderBottom: "2px solid #eee",
      fontWeight: "600",
      color: "#666",
    },
    td: {
      padding: "10px 5px",
      borderBottom: "1px solid #f0f0f0",
    },
    tdCenter: {
      padding: "10px 5px",
      borderBottom: "1px solid #f0f0f0",
      textAlign: "center" as const,
    },
    tr: {
      cursor: "pointer",
    },
    trHover: {
      backgroundColor: "#f8f9fa",
    },
    button: {
      padding: "5px 12px",
      borderRadius: "4px",
      border: "none",
      fontSize: "12px",
      cursor: "pointer",
      fontWeight: "500",
    },
    registerButton: {
      backgroundColor: "#007bff",
      color: "white",
    },
    registerButtonHover: {
      backgroundColor: "#0056b3",
    },
    disabledButton: {
      backgroundColor: "#ccc",
      color: "#666",
      cursor: "not-allowed",
    },
    cancelButton: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    cancelButtonHover: {
      backgroundColor: "#c82333",
    },
    enrollmentFull: {
      color: "#dc3545",
    },
    enrollmentAvailable: {
      color: "#28a745",
    },
    emptyMessage: {
      textAlign: "center" as const,
      color: "#888",
      padding: "30px 0",
      fontStyle: "italic",
    },
    blueText: {
      color: "#007bff",
    },
    greenText: {
      color: "#28a745",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>수강신청 시스템</h1>

      {/* 신청 현황 */}
      <div style={styles.statusBox}>
        <h2 style={styles.statusTitle}>신청 현황</h2>
        <div style={styles.statusInfo}>
          <span style={styles.blueText}>
            신청 과목: {registeredCourses.length}/{MAX_COURSES}개
          </span>
          <span style={styles.greenText}>총 학점: {totalCredits}학점</span>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* 개설 과목 목록 */}
        <div style={styles.sectionBox}>
          <h2 style={styles.sectionTitle}>개설 과목 목록</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>과목명</th>
                <th style={styles.th}>교수</th>
                <th style={styles.thCenter}>학점</th>
                <th style={styles.th}>시간</th>
                <th style={styles.thCenter}>인원</th>
                <th style={styles.thCenter}>신청</th>
              </tr>
            </thead>
            <tbody>
              {availableCourses.map((course) => (
                <tr
                  key={course.id}
                  style={styles.tr}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={{ ...styles.td, fontWeight: "500" }}>
                    {course.name}
                  </td>
                  <td style={styles.td}>{course.professor}</td>
                  <td style={styles.tdCenter}>{course.credits}</td>
                  <td style={styles.td}>{course.time}</td>
                  <td style={styles.tdCenter}>
                    <span
                      style={
                        course.enrolled >= course.capacity
                          ? styles.enrollmentFull
                          : styles.enrollmentAvailable
                      }
                    >
                      {course.enrolled}/{course.capacity}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <button
                      onClick={() => registerCourse(course)}
                      disabled={
                        registeredCourses.find((c) => c.id === course.id) ||
                        course.enrolled >= course.capacity
                      }
                      style={{
                        ...styles.button,
                        ...(registeredCourses.find((c) => c.id === course.id) ||
                        course.enrolled >= course.capacity
                          ? styles.disabledButton
                          : styles.registerButton),
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#0056b3";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#007bff";
                        }
                      }}
                    >
                      {registeredCourses.find((c) => c.id === course.id)
                        ? "신청완료"
                        : "신청"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 신청한 과목 목록 */}
        <div style={styles.sectionBox}>
          <h2 style={styles.sectionTitle}>신청한 과목</h2>
          {registeredCourses.length === 0 ? (
            <p style={styles.emptyMessage}>신청한 과목이 없습니다.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>과목명</th>
                  <th style={styles.th}>교수</th>
                  <th style={styles.thCenter}>학점</th>
                  <th style={styles.th}>시간</th>
                  <th style={styles.thCenter}>취소</th>
                </tr>
              </thead>
              <tbody>
                {registeredCourses.map((course) => (
                  <tr
                    key={course.id}
                    style={styles.tr}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ ...styles.td, fontWeight: "500" }}>
                      {course.name}
                    </td>
                    <td style={styles.td}>{course.professor}</td>
                    <td style={styles.tdCenter}>{course.credits}</td>
                    <td style={styles.td}>{course.time}</td>
                    <td style={styles.tdCenter}>
                      <button
                        onClick={() => cancelCourse(course.id)}
                        style={{ ...styles.button, ...styles.cancelButton }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#c82333")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc3545")
                        }
                      >
                        취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
