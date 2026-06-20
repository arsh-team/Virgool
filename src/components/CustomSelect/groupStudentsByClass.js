// Helper: group students by their enrolled class, sorted by grade.
// Returns an array of { label, students } suitable for rendering <optgroup>.
//
//   import { groupStudentsByClass } from "../../components/CustomSelect/groupStudentsByClass";
//   const groups = groupStudentsByClass(students);
//   groups.map(g => <optgroup key={g.label} label={g.label}>
//     {g.students.map(s => <option key={s._id} value={s._id}>{s.firstname} {s.lastname}</option>)}
//   </optgroup>)
//
// Students without a class are collected into a "بدون کلاس" group at the end.

function gradeSortValue(grade) {
  if (grade === undefined || grade === null || grade === "") return Infinity;
  const n = Number(grade);
  if (!Number.isNaN(n)) return n;
  // try to parse persian digits
  const persian = String(grade).replace(/[۰-۹]/g, (d) =>
    "۰۱۲۳۴۵۶۷۸۹".indexOf(d),
  );
  const n2 = Number(persian);
  if (!Number.isNaN(n2)) return n2;
  return String(grade);
}

export function groupStudentsByClass(students) {
  const byClassKey = new Map();
  const noClass = [];

  (students || []).forEach((s) => {
    const cls = s?.studentInfo?.enrolledClass;
    if (cls && cls._id) {
      const key = String(cls._id);
      if (!byClassKey.has(key)) {
        byClassKey.set(key, {
          label: `${cls.name || "بدون نام"}${cls.grade ? ` - پایه ${cls.grade}` : ""}`,
          grade: cls.grade,
          students: [],
        });
      }
      byClassKey.get(key).students.push(s);
    } else {
      noClass.push(s);
    }
  });

  const grouped = Array.from(byClassKey.values()).sort((a, b) => {
    const ga = gradeSortValue(a.grade);
    const gb = gradeSortValue(b.grade);
    if (ga < gb) return -1;
    if (ga > gb) return 1;
    return String(a.label).localeCompare(String(b.label), "fa");
  });

  if (noClass.length) {
    grouped.push({ label: "بدون کلاس", students: noClass });
  }

  return grouped;
}
