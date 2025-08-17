# Profile Data Flow Testing Guide

## 🎯 Objective
Ensure user data flows correctly from registration/login → profile initialization → profile updates

## 🔧 Changes Made

### Backend API Response (`Back-End/service/userService.js`)
✅ **Registration Response** now includes:
```json
{
  "message": "הרשמה הצליחה",
  "token": "...",
  "user": {
    "id": "...",
    "fullName": "John Doe",           // ✅ User's actual name
    "studentName": "John's Child",    // ✅ Child's name (parents only)
    "parentEmail": "john@email.com",  // ✅ User's email
    "email": "john@email.com",        // ✅ Fallback email field
    "role": "parent",
    "subject": "",                    // ✅ Subject (teachers only)
    "studentId": "123456789",         // ✅ Child's ID (parents only)
    "grade": "ב",                     // ✅ Child's grade (parents only)
    "username": "john123"
  }
}
```

✅ **Login Response** has identical structure

✅ **JWT Token** now contains:
```json
{
  "id": "...",
  "fullName": "John Doe",    // ✅ Changed from studentName
  "email": "john@email.com",
  "role": "parent",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Frontend Profile Initialization

✅ **UserProfile.js**:
- Loads `fullName`, `studentName`, `parentEmail` from AsyncStorage
- Falls back to token data if AsyncStorage is incomplete
- Shows "שם התלמיד" field only for parents
- Displays correct field labels

✅ **ParentUserProfile.js**:
- Loads `fullName` and `email` on component mount
- Initializes form fields with stored data

### Profile Update Flow

✅ **Save Function**:
- Sends correct field mapping to backend (`name`, `studentName`, `email`)
- Updates AsyncStorage with new data structure
- Immediately reflects changes in UI

## 🧪 Testing Steps

### 1. Registration Flow Test
```bash
# Test Registration
1. Open SignupScreen
2. Fill form:
   - Name: "John Doe"
   - Email: "john@test.com"
   - Username: "john123"
   - Password: "password123"
   - Role: "הורה" (Parent)
   - Student Name: "John's Child"
   - Student ID: "123456789"
   - Grade: "ב"
3. Submit registration
4. Should auto-redirect to Parent-Dashboard
5. Navigate to Profile
6. ✅ Verify fields are populated:
   - שם מלא: "John Doe"
   - שם התלמיד: "John's Child"
   - אימייל: "john@test.com"
```

### 2. Login Flow Test
```bash
# Test Login
1. Open LoginScreen
2. Login with existing user
3. Navigate to Profile
4. ✅ Verify all fields populated correctly
```

### 3. Profile Update Test
```bash
# Test Profile Updates
1. Navigate to Profile
2. Click "ערוך פרטים" (Edit Details)
3. Change fields:
   - שם מלא: "John Updated"
   - אימייל: "john.new@test.com"
4. Click "שמור שינויים" (Save Changes)
5. ✅ Verify changes appear immediately
6. Logout and login again
7. ✅ Verify changes persisted
```

### 4. Token Verification Test
```bash
# Test Token Data
1. Navigate to Profile
2. Scroll to "JWT Token Verification" section
3. ✅ Verify shows:
   - Token Valid: ✅
   - Full Name: correct value
   - Email: correct value
   - Role: correct value
```

## 🐛 Debug Console Logs

When testing, check console for these logs:

```javascript
// Registration/Login
📥 Stored user data: { fullName: "...", studentName: "...", ... }

// Profile Loading
🔍 Debugging data sources:
  AsyncStorage user: { fullName: "...", ... }
  Token user: { fullName: "...", ... }

// Profile Updates
✅ Profile updated successfully: { fullName: "...", ... }
```

## 🚨 Common Issues & Solutions

**Issue**: Fields still empty after registration
- Check: Console logs show stored data?
- Check: Backend response includes fullName, studentName, parentEmail?
- Solution: Clear app storage and re-register

**Issue**: Token verification fails
- Check: Token contains fullName (not studentName)?
- Solution: Re-login to get new token with correct structure

**Issue**: Profile updates not persisting
- Check: Save function updates AsyncStorage?
- Check: Backend receives correct field names?
- Solution: Verify PUT endpoint accepts `name`, `studentName`, `email`

## ✅ Expected Final State

After successful implementation:
1. ✅ Registration auto-populates profile
2. ✅ Login loads all existing data
3. ✅ Profile updates work immediately
4. ✅ Data persists across app restarts
5. ✅ Token contains correct user info
6. ✅ Different user types show appropriate fields

## 📋 Verification Checklist

- [ ] Register new parent → profile shows fullName, studentName, email
- [ ] Register new teacher → profile shows fullName, email, subject
- [ ] Login existing user → profile populated correctly
- [ ] Edit profile → changes save and display immediately
- [ ] Logout/login → changes persist
- [ ] Token verification section shows valid data
- [ ] Parent profiles show child fields, teacher profiles don't
