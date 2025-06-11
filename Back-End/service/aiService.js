function generateTemplate({ className, studentCount, grade, subject }, role) {
  console.log("hello");
  if (role === "teacher") {
    return [
            `שלום, אני מורה בכיתה ${grade} (${className}), עם ${studentCount} תלמידים/ות. אני מחפש/ת דרך לשפר את הוראת מקצוע ה-${subject} באמצעות כלים של בינה מלאכותית. אשמח למידע, תוכן או הצעות לפעילויות חינוכיות חדשניות שיכולות להעשיר את ההוראה ולהעצים את הבנת התלמידים.`,

            `שלום! במסגרת ההוראה בכיתה ${grade} (${className}), שבה ${studentCount} תלמידים, נתקלתי באתגרי הוראה בתחום ה-${subject}. אבקש שתציע/י לי:
        - הסברים פשוטים ומובנים לנושאים מרכזיים
        - תרגולים אינטראקטיביים או משחקים לימודיים
        - חומרי הוראה חזותיים/שמיעתיים
        - דרכים לגיוון דרכי ההסבר לפי סגנונות למידה שונים`,

            `שלום מערכת AI יקרה, אני מורה למקצוע ה-${subject} בכיתה ${grade} (${className}) שבה ${studentCount} תלמידים. אני מעוניין/ת לבנות מערך שיעור חכם שיתבסס על עקרונות של הוראה מותאמת אישית בעזרת בינה מלאכותית. אשמח אם תציע/י:
        - תכנית שיעור שבועית
        - שאלות דיון
        - פעילויות למידה מגוונות
        - עזרים דיגיטליים
        - תרגולים לפי רמות קושי שונות

        תודה מראש 🙏`
    ];
  }

  // בעתיד - תבניות להורה
  return [`שלום 👋, עדיין אין תבניות להורים.`];
}

module.exports = { generateTemplate };
