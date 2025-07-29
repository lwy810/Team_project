-- courses 테이블
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  professor TEXT NOT NULL,
  credits INTEGER NOT NULL,
  time TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled INTEGER DEFAULT 0
);

-- registrations 테이블
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO courses (id, name, professor, credits, time, capacity, enrolled) VALUES
('CS101', '프로그래밍 기초', '김교수', 3, '월수금 10:00-11:00', 50, 35),
('CS201', '자료구조', '이교수', 3, '화목 13:00-14:30', 40, 28),
('CS301', '데이터베이스', '박교수', 3, '월수 15:00-16:30', 35, 32),
('MATH101', '미적분학', '최교수', 3, '화목금 09:00-10:00', 60, 45),
('ENG101', '영어회화', 'Smith', 2, '월수 11:00-12:00', 25, 20),
('CS202', '알고리즘', '정교수', 3, '화목 10:00-11:30', 45, 38),
('PHYS101', '일반물리학', '강교수', 3, '월수금 14:00-15:00', 55, 42),
('MATH201', '선형대수', '윤교수', 3, '화목 15:00-16:30', 40, 25),
('CS401', '소프트웨어공학', '조교수', 3, '월수 13:00-14:30', 30, 18),
('ENG201', '기술영어', 'Johnson', 2, '금 09:00-11:00', 35, 30);

select * from registrations;