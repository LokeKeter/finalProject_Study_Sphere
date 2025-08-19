function generateTemplate(data, role) {
  if (role === "teacher") {
    const { className, studentCount, grade, subject } = data;
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

  if (role === 'parent') {
    const { childName, age, grade, subject } = data;
    return [`שלום, אני הורה לילד/ה בשם ${childName}, בגיל ${age}, הלומד/ת בכיתה ${grade}. ברצוני לסייע לו/לה להבין טוב יותר את מקצוע ה-${subject} בו הוא/היא חווה קושי. אשמח לקבל הסבר מפורט על נושאים מרכזיים במקצוע זה ברמת הכיתה, כולל דוגמאות פשוטות, המחשות, ותרגול מותאם. כמו כן, אודה להמלצה על אסטרטגיות למידה מתאימות לפי הגיל ורמת ההבנה.`,

    `שלום! אני מחפש/ת עזרה לימודית עבור ${childName}, בן/בת ${age}, תלמיד/ה בכיתה ${grade}. נושא הלימוד שבו אנו נתקלים בקושי הוא ${subject}. אני זקוק/ה לתוכן לימודי מותאם אישית שיכלול:
    1. הסבר תיאורטי ברור ופשוט
    2. דוגמאות מוחשיות או מצבים מחיי היומיום
    3. תרגילים עם פתרונות לדוגמה
    4. הצעות לשיפור הבנת החומר
    תודה רבה מראש!`,

      `שלום מערכת בינה מלאכותית, אנא עזרי לי ליצור תוכנית תמיכה לימודית ב-${subject} עבור ילדי ${childName}, בן/בת ${age}, בכיתה ${grade}. 
    המטרה: לשפר את ההבנה, הביטחון והיכולות שלו/ה במקצוע זה.
    מבוקש:
    - הסבר עקרונות יסוד לפי רמת הכיתה
    - הדגמות/אנלוגיות חזותיות או שמיעתיות
    - שאלות חזרה ותשובות
    - המלצות למשאבים דיגיטליים חינמיים (כגון סרטונים או משחקים)
    - תכנית תרגול יומית של 10-15 דקות

    אשמח לכל עזרה, תודה מראש 🙏`];
  }
}

module.exports = { generateTemplate };
