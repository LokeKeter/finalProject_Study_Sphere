# מערכת Study Sphere - מדריך התקנה והפעלה

## סקירה כללית
מערכת Study Sphere היא פלטפורמה לניהול לימודים המורכבת מפרונטאנד (React Native) ובקאנד (Node.js + MongoDB) עם תכונות ניהול מתקדמות למנהלי מערכת.

## תכונות עיקריות

### למנהלי מערכת (Admin)
- ניהול משתמשים (הוספה, עריכה, מחיקה)
- שיוך מורים לכיתות
- יצירת כיתות חדשות
- חלוקת תלמידים לכיתות
- מעקב אחר תלמידים לא משויכים

### למורים (Teachers)
- ניהול כיתות
- שליחת שיעורי בית
- ניהול נוכחות
- תקשורת עם הורים
- יצירת תבניות AI

### להורים (Parents)
- צפייה בשיעורי בית
- מעקב אחר ציונים
- תקשורת עם מורים
- מעקב אחר נוכחות
- תבניות AI לעזרה בלימודים

## דרישות מערכת

### Backend
- Node.js (גרסה 16+)
- MongoDB (גרסה 5+)
- npm או yarn

### Frontend
- React Native
- Expo CLI
- Android Studio / Xcode

## התקנה

### 1. הגדרת בסיס הנתונים
```bash
# התקן MongoDB ובדוק שהוא פועל
mongod --version

# הפעל MongoDB
mongod
```

### 2. הגדרת Backend
```bash
cd Back-End

# התקן תלויות
npm install

# צור קובץ .env
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studysphere
JWT_SECRET=your_super_secure_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EOL

# הפעל את השרת
npm start
```

### 3. הגדרת Frontend
```bash
# מהתיקייה הראשית
npm install

# עדכן את כתובת השרת בקובץ config.js
echo 'export const API_BASE_URL = "http://localhost:5000";' > config.js

# הפעל את האפליקציה
npx expo start
```

## יצירת משתמש מנהל ראשון

לאחר הפעלת השרת, צור משתמש מנהל באמצעות MongoDB או script:

```javascript
// בקונסול MongoDB
use studysphere
db.users.insertOne({
  name: "מנהל מערכת",
  email: "admin@studysphere.com",
  username: "admin",
  password: "$2b$10$hashed_password_here", // השתמש בכלי הצפנה
  role: "admin",
  createdAt: new Date()
})
```

## הפעלת המערכת

### Backend
```bash
cd Back-End
npm start
```
השרת יפעל על פורט 5000

### Frontend
```bash
npx expo start
```
האפליקציה תפעל על Expo development server

## API Endpoints עיקריים

### Authentication
- `POST /api/users/login` - התחברות
- `POST /api/users/register` - הרשמה

### Admin Management
- `GET /api/users/users` - קבלת כל המשתמשים
- `GET /api/users/teachers` - קבלת כל המורים
- `GET /api/users/parents` - קבלת כל ההורים
- `POST /api/users/assign-teacher` - שיוך מורה לכיתה
- `POST /api/users/remove-teacher` - הסרת מורה מכיתה

### Class Management
- `GET /api/class` - קבלת כל הכיתות
- `POST /api/class` - יצירת כיתה חדשה
- `POST /api/class/students/add` - הוספת תלמיד לכיתה
- `POST /api/class/students/remove` - הסרת תלמיד מכיתה
- `GET /api/class/students/unassigned` - קבלת תלמידים לא משויכים

### Homework & Communication
- `POST /api/class/homework/send` - שליחת שיעורי בית
- `POST /api/communication/send-class-message` - שליחת הודעה לכיתה

## מבנה תפקידים

### Admin
- גישה מלאה לכל הפונקציות
- ניהול משתמשים וכיתות
- שיוך מורים לכיתות

### Teacher
- גישה לכיתות המשויכות
- שליחת שיעורי בית והודעות
- ניהול נוכחות

### Parent
- צפייה במידע התלמיד
- קבלת הודעות משיעורי בית
- תקשורת עם מורים

## פתרון בעיות נפוצות

### שגיאת חיבור לבסיס נתונים
```bash
# בדוק שMongoDB פועל
ps aux | grep mongod

# הפעל MongoDB אם לא פועל
mongod
```

### שגיאת CORS
וודא שכתובת הFrontend מוגדרת בserver.js:
```javascript
app.use(cors({
  origin: ["http://localhost:8081", "http://localhost:3000"],
  credentials: true
}));
```

### שגיאת JWT
בדוק שהמשתנה JWT_SECRET מוגדר בקובץ .env

## תמיכה

לבעיות טכניות או שאלות, פנו למפתחי המערכת.

## רישיון
המערכת מוגנת בזכויות יוצרים לפי הרישיון המצורף.