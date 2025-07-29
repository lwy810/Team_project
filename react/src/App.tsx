import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import './App.css';

// Supabase 클라이언트 설정 (환경변수에서 로드)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 실제 Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState("student123"); // 실제로는 로그인 시스템에서 가져옴

  const MAX_COURSES = 8;

  // 데이터 로드
  useEffect(() => {
    loadCourses();
    loadRegistrations();
    setupRealtimeSubscription();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error("과목 데이터 로드 실패:", error);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(
          `
          *,
          courses (*)
        `
        )
        .eq("student_id", studentId);

      if (error) throw error;

      const registered = (data || []).map((reg) => reg.courses);
      setRegisteredCourses(registered);
    } catch (error) {
      console.error("신청 과목 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 실시간 업데이트 구독
  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel("course-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => {
          loadCourses();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => {
          loadRegistrations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // 수강신청
  const registerCourse = async (course: Course) => {
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

    try {
      setLoading(true);

      // 신청 테이블에 추가
      const { error: regError } = await supabase.from("registrations").insert({
        student_id: studentId,
        course_id: course.id,
      });

      if (regError) throw regError;

      // 수강인원 증가
      const { error: courseError } = await supabase
        .from("courses")
        .update({ enrolled: course.enrolled + 1 })
        .eq("id", course.id);

      if (courseError) throw courseError;

      // 로컬 상태 업데이트
      setRegisteredCourses([...registeredCourses, course]);
      setAvailableCourses(
        availableCourses.map((c) =>
          c.id === course.id ? { ...c, enrolled: c.enrolled + 1 } : c
        )
      );

      alert("수강신청이 완료되었습니다.");
    } catch (error) {
      console.error("수강신청 실패:", error);
      alert("수강신청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 수강신청 취소
  const cancelCourse = async (courseId: string) => {
    try {
      setLoading(true);

      // 신청 테이블에서 삭제
      const { error: regError } = await supabase
        .from("registrations")
        .delete()
        .eq("student_id", studentId)
        .eq("course_id", courseId);

      if (regError) throw regError;

      // 수강인원 감소
      const course = availableCourses.find((c) => c.id === courseId);
      if (course) {
        const { error: courseError } = await supabase
          .from("courses")
          .update({ enrolled: course.enrolled - 1 })
          .eq("id", courseId);

        if (courseError) throw courseError;
      }

      // 로컬 상태 업데이트
      setRegisteredCourses(registeredCourses.filter((c) => c.id !== courseId));
      setAvailableCourses(
        availableCourses.map((c) =>
          c.id === courseId ? { ...c, enrolled: c.enrolled - 1 } : c
        )
      );

      alert("수강신청이 취소되었습니다.");
    } catch (error) {
      console.error("수강신청 취소 실패:", error);
      alert("수강신청 취소에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = registeredCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  if (loading && availableCourses.length === 0) {
    return (
      <div>
        <div>
          <div></div>
        </div>
        <h1>데이터 로딩 중...</h1>
      </div>
    );
  }

  return (
    
    <div>
      <header>
        <nav>
          <ul className="nav_bar">
            <li>
              <h1>주문 발주 ERP</h1>
            </li>
            <li>
              <a href="https://www.google.com"><span>1.</span><span>로그인</span></a>
              <a href="https://www.naver.com"><span>2.</span><span>회원가입</span></a>
            </li>
          </ul>
        </nav>
      </header>

      <section>
        <div className="side_bar">
          <ul id="main_menu">
            <li>
              <p className="main_menu_title">■ 직원</p>
              <ul className="sub_menu">
                <li>- 출결 관리</li>
                <li>- 직원 검색</li>
              </ul>
            </li> 
            <li>
              <p className="main_menu_title">■ 재고</p>
              <ul className="sub_menu">
                <li>- 제품 등록</li>
                <li>- 재고 확인</li>
              </ul>
            </li>
            <li>
              <p className="main_menu_title">■ 발주</p>
              <ul className="sub_menu">
                <li>- 발주 신청</li>
                <li>- 발주 상태 확인</li>
              </ul>
            </li>
          </ul>



        </div>
          
        <div className="main_board">  
          <h2>Dash Board</h2>

          <div>
            <strong>📋 Supabase 데이터베이스 연결됨:</strong>
            <br />
            ✅ 실제 Supabase 데이터베이스에 연결되어 있습니다.
            <br />
            📊 필요한 테이블: courses (과목), registrations (수강신청)
            <br />
            🔄 실시간 업데이트가 활성화되어 있습니다.
          </div>

          {/* 신청 현황 */}
          {/* <div style={styles.statusBox}>
            <h2 style={styles.statusTitle}>신청 현황</h2>
            <div style={styles.statusInfo}>
              <span style={styles.blueText}>
                신청 과목: {registeredCourses.length}/{MAX_COURSES}개
              </span>
              <span style={styles.greenText}>총 학점: {totalCredits}학점</span>
              <span>학생 ID: {studentId}</span>
            </div> 
          </div>

          <div style={styles.mainContent}>
            {/* 개설 과목 목록 
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
                            loading ||
                            !!registeredCourses.find((c) => c.id === course.id) ||
                            course.enrolled >= course.capacity
                          }
                          style={{
                            ...styles.button,
                            ...(loading ||
                            registeredCourses.find((c) => c.id === course.id) ||
                            course.enrolled >= course.capacity
                              ? styles.disabledButton
                              : styles.registerButton),
                          }}
                        >
                          {registeredCourses.find((c) => c.id === course.id)
                            ? "신청완료"
                            : loading
                            ? "처리중..."
                            : "신청"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 신청한 과목 목록 
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
                            disabled={loading}
                            style={{
                              ...styles.button,
                              ...(loading
                                ? styles.disabledButton
                                : styles.cancelButton),
                            }} 
                          >
                            {loading ? "처리중..." : "취소"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>*/}
        </div>
      </section>  
    </div>
  );
};

export default App;
