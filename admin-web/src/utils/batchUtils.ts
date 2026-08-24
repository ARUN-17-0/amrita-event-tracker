export interface BatchSemesterInfo {
  semesterNumber: number | null;
  academicYear: number | null;
  status: 'upcoming' | 'active' | 'graduated';
  label: string;
  semesterType: 'odd' | 'even' | null;
}

export function getBatchSemester(batchYearInput: number | string, date = new Date()): BatchSemesterInfo {
  const batchYear = typeof batchYearInput === 'string' ? parseInt(batchYearInput, 10) : batchYearInput;
  if (!batchYear || isNaN(batchYear)) {
    return { semesterNumber: null, academicYear: null, status: 'upcoming', label: 'Invalid Year', semesterType: null };
  }

  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1; // 1 to 12

  let semNum = 0;
  let isOdd = false;

  if (currentMonth >= 7) {
    // Odd Semester (Jul - Dec)
    const yearDiff = currentYear - batchYear + 1;
    semNum = yearDiff * 2 - 1;
    isOdd = true;
  } else {
    // Even Semester (Jan - Jun)
    const yearDiff = currentYear - batchYear;
    semNum = yearDiff * 2;
    isOdd = false;
  }

  if (semNum < 1) {
    return {
      semesterNumber: null,
      academicYear: null,
      status: 'upcoming',
      label: 'Upcoming Batch',
      semesterType: null
    };
  }

  if (semNum > 8) {
    return {
      semesterNumber: null,
      academicYear: 4,
      status: 'graduated',
      label: 'Graduated',
      semesterType: null
    };
  }

  const yearNames = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const academicYear = Math.ceil(semNum / 2);
  const yearName = yearNames[academicYear - 1] || `${academicYear}th Year`;

  return {
    semesterNumber: semNum,
    academicYear,
    status: 'active',
    label: `Sem ${semNum} (${yearName})`,
    semesterType: isOdd ? 'odd' : 'even'
  };
}
