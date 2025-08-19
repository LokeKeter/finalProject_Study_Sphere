const Communication = require("../models/Communication");
const User = require("../models/User");
const Class = require("../models/Class");
const mongoose = require('mongoose');
const Student = require("../models/Student");
const jwt = require('jsonwebtoken');

exports.createLetter = async (senderId, receiverId, subject, content) => {
  try {
    console.log('📬 createLetter called with:', { 
      senderId, 
      receiverId, 
      subject, 
      content: content?.substring(0, 20) + '...' // Log just part of the content
    });
    
    // ✅ Validate ObjectIds with better error handling
    if (!senderId) {
      console.error('❌ Missing senderId');
      throw new Error("מזהה שולח חסר");
    }
    
    if (!receiverId) {
      console.error('❌ Missing receiverId');
      throw new Error("מזהה מקבל חסר");
    }
    
    // Convert to ObjectId if they're strings
    const senderObjectId = typeof senderId === 'string' ? 
      mongoose.Types.ObjectId.isValid(senderId) ? new mongoose.Types.ObjectId(senderId) : null : 
      senderId;
      
    const receiverObjectId = typeof receiverId === 'string' ? 
      mongoose.Types.ObjectId.isValid(receiverId) ? new mongoose.Types.ObjectId(receiverId) : null : 
      receiverId;
    
    if (!senderObjectId) {
      console.error('❌ Invalid senderId format:', senderId);
      throw new Error("מזהה שולח לא תקין");
    }
    
    if (!receiverObjectId && !receiverId.startsWith('temp-parent-')) {
      console.error('❌ Invalid receiverId format:', receiverId);
      throw new Error("מזהה מקבל לא תקין");
    }

    // ✅ Verify sender and receiver exist with detailed logging
    console.log('🔍 Looking up sender with ID:', senderObjectId);
    const sender = await User.findById(senderObjectId);
    console.log('👤 Sender lookup result:', sender ? `Found: ${sender.name}` : 'Not found');
    
    if (!sender) {
      throw new Error("משתמש שולח לא נמצא במערכת");
    }

    console.log('🔍 Looking up receiver with ID:', receiverObjectId || receiverId);
    let receiver = receiverObjectId ? await User.findById(receiverObjectId) : null;
    console.log('👤 Receiver lookup result:', receiver ? `Found: ${receiver.name}` : 'Not found');
    
    // If receiver not found, try looking up in Student.parentIds
    if (!receiver) {
      console.log('🔍 Receiver not found as User, checking Student.parentIds...');
      // Check if this ID is in any student's parentIds array
      const studentWithParent = receiverObjectId ? 
        await Student.findOne({ parentIds: receiverObjectId }) : null;
      
      if (studentWithParent) {
        console.log('👨‍👩‍👧‍👦 Found student with this parent ID:', studentWithParent.name);
        try {
          // Create the parent user if it doesn't exist
          const newParent = await User.create({
            _id: receiverObjectId,
            name: `הורה של ${studentWithParent.name}`,
            role: 'parent',
            email: `parent_${receiverObjectId}@placeholder.com`,
            username: `parent_${receiverObjectId}`,
            password: 'placeholder123' // This should be changed by the admin later
          });
          console.log('✅ Created new parent user:', newParent.name);
          
          // Use the newly created parent
          receiver = newParent;
        } catch (createError) {
          console.error('❌ Error creating parent user:', createError);
          // Try to find the user again in case it was created between our checks
          receiver = await User.findById(receiverObjectId);
          if (!receiver) {
            throw new Error("לא ניתן ליצור משתמש הורה חדש");
          }
        }
      } else if (receiverId.startsWith('temp-parent-')) {
        // This is a temporary parent ID, create a placeholder user
        console.log('👤 Creating placeholder parent for temporary ID:', receiverId);
        try {
          // Generate a proper ObjectId for the new parent
          const newParentId = new mongoose.Types.ObjectId();
          
          // Create a placeholder parent user
          const newParent = await User.create({
            _id: newParentId,
            name: `הורה זמני`,
            role: 'parent',
            email: `temp_${receiverId}@placeholder.com`,
            username: `temp_${receiverId}`,
            password: 'placeholder123' // This should be changed by the admin later
          });
          
          console.log('✅ Created placeholder parent user:', newParent.name, 'with ID:', newParentId);
          
          // Use the newly created parent
          receiver = newParent;
          receiverObjectId = newParentId;
        } catch (createError) {
          console.error('❌ Error creating placeholder parent:', createError);
          throw new Error("לא ניתן ליצור משתמש הורה זמני");
        }
      } else {
        console.error('❌ Receiver not found in Users or Student.parentIds');
        throw new Error("משתמש מקבל לא נמצא במערכת");
      }
    }

    console.log('📤 Creating letter between users:', {
      sender: { id: sender._id, name: sender.name, role: sender.role },
      receiver: { id: receiver._id, name: receiver.name, role: receiver.role }
    });

    const letter = await Communication.create({ 
      type: "letter", 
      senderId: senderObjectId, 
      receiverId: receiver._id, 
      subject, 
      content 
    });
    
    console.log('✅ Letter created successfully with ID:', letter._id);

    return letter;
    
  } catch (error) {
    console.error('❌ Error in createLetter service:', error);
    throw error;
  }
};

// New function to create a letter with auto-parent creation
exports.createLetterWithParent = async (senderId, tempParentId, subject, content, studentName) => {
  try {
    console.log('📬 createLetterWithParent called with:', { 
      senderId, 
      tempParentId,
      studentName,
      subject, 
      content: content?.substring(0, 20) + '...'
    });
    
    // ✅ Validate required fields
    if (!senderId) {
      console.error('❌ Missing senderId');
      throw new Error("מזהה שולח חסר");
    }
    
    if (!studentName) {
      console.error('❌ Missing studentName');
      throw new Error("שם תלמיד חסר");
    }
    
    // Convert sender ID to ObjectId if it's a string
    const senderObjectId = typeof senderId === 'string' ? 
      mongoose.Types.ObjectId.isValid(senderId) ? new mongoose.Types.ObjectId(senderId) : null : 
      senderId;
    
    if (!senderObjectId) {
      console.error('❌ Invalid senderId format:', senderId);
      throw new Error("מזהה שולח לא תקין");
    }

    // ✅ Verify sender exists
    console.log('🔍 Looking up sender with ID:', senderObjectId);
    const sender = await User.findById(senderObjectId);
    console.log('👤 Sender lookup result:', sender ? `Found: ${sender.name}` : 'Not found');
    
    if (!sender) {
      throw new Error("משתמש שולח לא נמצא במערכת");
    }

    // Create a new parent user
    console.log('👤 Creating new parent user for student:', studentName);
    const newParentId = new mongoose.Types.ObjectId();
    
    try {
      // Create a new parent user
      const newParent = await User.create({
        _id: newParentId,
        name: `הורה של ${studentName}`,
        role: 'parent',
        email: `parent_${newParentId}@placeholder.com`,
        username: `parent_${Date.now()}`,
        password: 'placeholder123', // This should be changed by the admin later
        studentName: studentName
      });
      
      console.log('✅ Created new parent user:', newParent.name, 'with ID:', newParentId);
      
      // Try to find the student by name and update their parentIds
      const student = await Student.findOne({ name: studentName });
      if (student) {
        console.log('👨‍👩‍👧‍👦 Found student with name:', studentName);
        
        // Add the new parent ID to the student's parentIds array
        if (!student.parentIds) {
          student.parentIds = [newParentId];
        } else {
          student.parentIds.push(newParentId);
        }
        
        await student.save();
        console.log('✅ Updated student with new parent ID');
      } else {
        console.log('⚠️ No student found with name:', studentName);
      }
      
      // Create the letter
      console.log('📤 Creating letter from', sender.name, 'to new parent');
      const letter = await Communication.create({ 
        type: "letter", 
        senderId: senderObjectId, 
        receiverId: newParentId, 
        subject, 
        content 
      });
      
      console.log('✅ Letter created successfully with ID:', letter._id);
      
      return {
        letter,
        newParent: {
          id: newParentId,
          name: newParent.name
        }
      };
      
    } catch (error) {
      console.error('❌ Error creating parent or letter:', error);
      throw new Error(`לא ניתן ליצור משתמש הורה: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error in createLetterWithParent service:', error);
    throw error;
  }
};

exports.createSignature = async (senderId, receiverId, content, fileUrl) => {
  try {
    console.log('📝 createSignature called with:', { 
      senderId, 
      receiverId, 
      content: content?.substring(0, 20) + '...', 
      fileUrl: fileUrl?.substring(0, 30) + '...' 
    });
    
    // ✅ Validate ObjectIds with better error handling
    if (!senderId) {
      console.error('❌ Missing senderId');
      throw new Error("מזהה שולח חסר");
    }
    
    if (!receiverId) {
      console.error('❌ Missing receiverId');
      throw new Error("מזהה מקבל חסר");
    }
    
    // Convert to ObjectId if they're strings
    const senderObjectId = typeof senderId === 'string' ? 
      mongoose.Types.ObjectId.isValid(senderId) ? new mongoose.Types.ObjectId(senderId) : null : 
      senderId;
      
    const receiverObjectId = typeof receiverId === 'string' ? 
      mongoose.Types.ObjectId.isValid(receiverId) ? new mongoose.Types.ObjectId(receiverId) : null : 
      receiverId;
    
    if (!senderObjectId) {
      console.error('❌ Invalid senderId format:', senderId);
      throw new Error("מזהה שולח לא תקין");
    }
    
    if (!receiverObjectId) {
      console.error('❌ Invalid receiverId format:', receiverId);
      throw new Error("מזהה מקבל לא תקין");
    }

    // ✅ Verify sender and receiver exist with detailed logging
    console.log('🔍 Looking up sender with ID:', senderObjectId);
    const sender = await User.findById(senderObjectId);
    console.log('👤 Sender lookup result:', sender ? `Found: ${sender.name}` : 'Not found');
    
    if (!sender) {
      throw new Error("משתמש שולח לא נמצא במערכת");
    }

    console.log('🔍 Looking up receiver with ID:', receiverObjectId);
    let receiver = await User.findById(receiverObjectId);
    console.log('👤 Receiver lookup result:', receiver ? `Found: ${receiver.name}` : 'Not found');
    
    // If receiver not found, try looking up in Student.parentIds
    if (!receiver) {
      console.log('🔍 Receiver not found as User, checking Student.parentIds...');
      // Check if this ID is in any student's parentIds array
      const studentWithParent = await Student.findOne({ parentIds: receiverObjectId });
      
      if (studentWithParent) {
        console.log('👨‍👩‍👧‍👦 Found student with this parent ID:', studentWithParent.name);
        try {
          // Create the parent user if it doesn't exist
          const newParent = await User.create({
            _id: receiverObjectId,
            name: `הורה של ${studentWithParent.name}`,
            role: 'parent',
            email: `parent_${receiverObjectId}@placeholder.com`,
            username: `parent_${receiverObjectId}`,
            password: 'placeholder123' // This should be changed by the admin later
          });
          console.log('✅ Created new parent user:', newParent.name);
          
          // Use the newly created parent
          receiver = newParent;
        } catch (createError) {
          console.error('❌ Error creating parent user:', createError);
          // Try to find the user again in case it was created between our checks
          receiver = await User.findById(receiverObjectId);
          if (!receiver) {
            throw new Error("לא ניתן ליצור משתמש הורה חדש");
          }
        }
      } else {
        console.error('❌ Receiver not found in Users or Student.parentIds');
        throw new Error("משתמש מקבל לא נמצא במערכת");
      }
    }

    console.log('📤 Creating signature between users:', {
      sender: { id: sender._id, name: sender.name, role: sender.role },
      receiver: { id: receiver._id, name: receiver.name, role: receiver.role },
      hasFile: !!fileUrl
    });

    const signature = await Communication.create({ 
      type: "signature", 
      senderId: senderObjectId, 
      receiverId: receiverObjectId, 
      content,
      fileUrl
    });
    
    console.log('✅ Signature created successfully with ID:', signature._id);

    return signature;
    
  } catch (error) {
    console.error('❌ Error in createSignature service:', error);
    throw error;
  }
};

exports.createMeeting = async (senderId, receiverId, subject, meetingDate, meetingType) => {
  // בדיקה אם קיימת כבר פגישה פעילה (type: meeting)
  const existing = await Communication.findOne({
    senderId,
    receiverId,
    type: "meeting"
  });

  if (existing) {
    throw new Error("כבר קיימת פגישה פעילה עם ההורה הזה");
  }

  // יצירת פגישה חדשה
  return Communication.create({ 
    type: "meeting", 
    senderId, 
    receiverId, 
    subject, 
    meetingDate, 
    meetingType 
  });
};

//ביטול פגישה
exports.cancelMeeting = async (senderId, receiverId) => {
  // 1. מחיקת הפגישה המקורית (האחרונה)
  const lastMeeting = await Communication.findOneAndDelete({
    type: "meeting",
    senderId,
    receiverId
  }, { sort: { createdAt: -1 } });
  // 2. אם לא נמצאה פגישה, החזר הודעת שגיאה
  if (!lastMeeting) {
    throw new Error("לא נמצאה פגישה לביטול");
  }

  // 3. שליפת שם מורה
  const teacher = await User.findById(senderId);
  const teacherName = teacher ? teacher.fullName || teacher.name || "המורה" : "המורה";

  // 4. יצירת מכתב חדש
  const cancelMessage = `הפגישה בתאריך ${lastMeeting.meetingDate} עם ${teacherName} בוטלה`;
  const newLetter = await Communication.create({
    type: "letter",
    senderId,
    receiverId,
    subject: "ביטול פגישה",
    content: cancelMessage
  });

  return newLetter;
};

exports.createFileUpload = async (senderId, receiverId, description, fileUrl) => {
  console.log("2.0");
  const newCommunication = new Communication({
    type: 'signature',
    senderId,
    receiverId,
    content: description, // נשמר בשדה content כי זה תיאור
    fileUrl,
    createdAt: new Date()
  });
  console.log("3.0");
  return await newCommunication.save();
};

exports.getUserArchive = async (userId) => {
  console.log('🔍 getUserArchive called with userId:', userId);
  try {

    // Fetch both sent and received messages for the user
    console.log('📩 Finding messages for user:', userId);
    // נתמוך גם במזהה כמחרוזת וגם כ-ObjectId
    const idsToMatch = [String(userId)];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      idsToMatch.push(new mongoose.Types.ObjectId(userId));
    }

    const messages = await Communication.find({
      receiverId: { $in: idsToMatch },   // ← רק הודעות שנשלחו אליי
      type: 'letter'                      // ← רק מכתבים
    })
    .sort({ createdAt: -1 })
    .populate("senderId", "name fullName")
    .lean();
    
    console.log(`✅ Found ${messages.length} messages for user ${userId}`);
    
    // Log the first message if available
    if (messages.length > 0) {
      console.log('📄 First message sample:', {
        id: messages[0]._id,
        type: messages[0].type,
        senderId: messages[0].senderId?._id || messages[0].senderId,
        receiverId: messages[0].receiverId?._id || messages[0].receiverId,
        subject: messages[0].subject
      });
    }

    const allClasses = await Class.find().lean();

  const result = messages.map(msg => {
    // Find associated class
    const classDoc = allClasses.find(cls =>
      cls.students && cls.students.some(s => s.parentId && 
        (s.parentId.toString() === (msg.receiverId?._id || msg.receiverId)?.toString() || 
         s.parentId.toString() === (msg.senderId?._id || msg.senderId)?.toString()))
    );
    
    // Determine if this message was sent or received by the current user
    const senderIdStr = (msg.senderId?._id || msg.senderId)?.toString();
    const messageDirection = senderIdStr === userId.toString() ? "נשלח" : "התקבל";
    
    // Create normalized message object
    return {
    id: String(msg._id),  // <- המרה למחרוזת
    title: msg.subject || "ללא נושא",
    sender: (msg.senderId?.fullName || msg.senderId?.name || "שולח לא ידוע"),
    date: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("he-IL") : "",
    content: msg.content || "",
    fileUrl: msg.fileUrl || ""
  };
  });
  
  console.log(`✅ Returning ${result.length} formatted messages`);
  return result;
  
  } catch (error) {
    console.error('❌ Error in getUserArchive:', error);
    return [];
  }
};

exports.sendClassMessage = async ({ classId, senderId, content }) => {
  const classDoc = await Class.findOne({ grade: classId });
  if (!classDoc) throw new Error("כיתה לא נמצאה");

  const parentIds = classDoc.students.map(s => s.parentId);

  const messages = parentIds.map(parentId => ({
    type: "letter",
    senderId,
    receiverId: parentId,
    subject: "הודעה כיתתית",
    content
  }));

  await Communication.insertMany(messages);
};

exports.getRecentDiscipline = async ({ teacherId, days = 2 }) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await Communication.find({
    type: "attend",
    senderId: teacherId,
    receiverId: { $ne: null },
    createdAt: { $gte: since }
  })
  .populate({ path: "receiverId", select: "name studentName" })
  .sort({ createdAt: -1 })
  .lean();

  return events;
};

exports.listRecentDiscipline = async ({ teacherId, days = 2 }) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // שאילתת DB + populate
  const events = await Communication.find({
    type: "attend",
    senderId: teacherId,
    createdAt: { $gte: since }
  })
  .populate({ path: "receiverId", select: "name studentName" })
  .sort({ createdAt: -1 })
  .lean();

  // מיפוי לפורמט שהפרונט רוצה לראות בחלון "משמעת"
  return events.map(ev => ({
    id: String(ev._id),
    title: ev.subject,
    parentName: ev.receiverId?.name || "",
    studentName: ev.receiverId?.studentName || "",
    date: ev.createdAt
  }));
};

exports.getRecentMeetings = async ({ days = 30, senderId } = {}) => {
  const query = { type: 'meeting' };

  // סינון לפי שולח (לא חובה)
  if (senderId) {
    if (mongoose.Types.ObjectId.isValid(senderId)) {
      // תומך גם במחרוזת וגם ב־ObjectId במסד
      query.$or = [
        { senderId: senderId },
        { senderId: new mongoose.Types.ObjectId(senderId) }
      ];
    } else {
      query.senderId = senderId; // שמור כמחרוזת?
    }
  }

  // סינון לפי טווח ימים (לא חובה)
  if (days) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    query.createdAt = { $gte: since };
  }

  // אפשר גם sort לפי meetingDate אם קיים; כרגע לפי createdAt
  return Communication
    .find(query)
    .populate({ path: 'receiverId', select: 'name studentName' }) // ⬅️ חשוב לשם התלמיד/מקבל
    .sort({ meetingDate: -1, createdAt: -1 })                      // ⬅️ אם יש meetingDate – תהיה עדיפות
    .lean();
};
exports.getTeachersForParent = async ({ parentId }) => {
  try {
    console.log('🔍 getTeachersForParent called with parentId:', parentId);
    
    if (!parentId) {
      console.error('❌ No parentId provided');
      throw new Error("parentId is required");
    }

    // תומך בשמירה כ-ObjectId או מחרוזת
    const idsToMatch = [String(parentId)];
    if (mongoose.Types.ObjectId.isValid(parentId)) {
      idsToMatch.push(new mongoose.Types.ObjectId(parentId));
    }
    
    console.log('🔍 Looking for classes with parentId in:', idsToMatch);

    // 1) מאתרים את כל הכיתות של הילדים של ההורה דרך Class.students.parentId
    const classDocs = await Class
      .find({ 'students.parentId': { $in: idsToMatch } })
      .select('grade')
      .lean();
    
    console.log('📚 Found classes:', classDocs.length);

    let grades = [...new Set(classDocs.map(c => String(c.grade)).filter(Boolean))];
    console.log('🏫 Grades from classes:', grades);

    // 1b) נפילה חלופית: אם אין match ב-Class, ננסה דרך Student.parentIds (שים לב שזה מערך!)
    if (!grades.length) {
      console.log('🔄 No classes found, trying Student collection with parentIds');
      const kids = await Student.find({ parentIds: { $in: idsToMatch } })
                                .select('grade classId name')
                                .lean();
      
      console.log('👨‍👩‍👧‍👦 Found students:', kids.length);
      
      if (kids.length) {
        console.log('👨‍👩‍👧‍👦 Student details:', kids.map(k => ({
          name: k.name,
          grade: k.grade,
          classId: k.classId
        })));
      }
      
      // Extract both full grades and just the Hebrew letter part
      const gFromStudents = [];
      kids.forEach(k => {
        if (k.grade) {
          // Add the full grade (e.g., "ו3")
          gFromStudents.push(String(k.grade));
          
          // Add just the Hebrew letter (e.g., "ו")
          const hebrewLetter = String(k.grade).charAt(0);
          if (hebrewLetter) {
            gFromStudents.push(hebrewLetter);
          }
        }
      });
      
      const extraGrades = [...new Set(gFromStudents)];
      console.log('🏫 Grades from students (with Hebrew letters):', extraGrades);
      grades = [...grades, ...extraGrades];
    }
    
    // 1c) אם עדיין אין כיתות, נחזיר את כל המורים
    if (!grades.length) {
      console.log('⚠️ No grades found for parent, returning all teachers');
      
      // אם אין כיתות, נחזיר את כל המורים
      const allTeachers = await User.find({
        role: 'teacher'
      })
      .select('_id name fullName subject assignedClasses email phone')
      .lean();
      
      console.log('👨‍🏫 Found teachers (all):', allTeachers.length);
      
      return allTeachers.map(t => ({
        _id: String(t._id),
        name: t.fullName || t.name || 'מורה',
        subject: t.subject || '',
        assignedClasses: t.assignedClasses || [],
        email: t.email || '',
        phone: t.phone || ''
      }));
    }

    // 2) מאתרים את כל המורים שמלמדים אחת מהכיתות הללו
    console.log('🔍 Looking for teachers with assignedClasses in:', grades);
    
    // Create query conditions for different matching strategies
    const queryConditions = [];
    
    // Exact match condition
    if (grades.length > 0) {
      queryConditions.push({ assignedClasses: { $in: grades } });
    }
    
    // Hebrew letter only match condition (for cases where teacher has "ו" and student has "ו3")
    const gradeLetters = grades
      .map(g => String(g).charAt(0))
      .filter(Boolean);
      
    console.log('🔤 Grade letters extracted:', gradeLetters);
    
    if (gradeLetters.length > 0) {
      // For each Hebrew letter, find teachers who have that letter in their assignedClasses
      gradeLetters.forEach(letter => {
        queryConditions.push({ 
          assignedClasses: { $elemMatch: { $regex: new RegExp(`^${letter}`) } } 
        });
      });
    }
    
    // If we have any conditions, run the query
    let teachers = [];
    if (queryConditions.length > 0) {
      teachers = await User.find({
        role: 'teacher',
        $or: queryConditions
      })
      .select('_id name fullName subject assignedClasses email phone')
      .lean();
      
      console.log('👨‍🏫 Found teachers with combined matching strategies:', teachers.length);
      
      // Log which teachers matched and their assigned classes
      if (teachers.length > 0) {
        console.log('👨‍🏫 Matched teachers and their classes:', teachers.map(t => ({
          name: t.name || t.fullName,
          assignedClasses: t.assignedClasses
        })));
      }
    }
    
    // אם עדיין אין מורים, נחזיר את כל המורים
    if (!teachers.length) {
      console.log('⚠️ No teachers found with any match, returning all teachers');
      
      teachers = await User.find({
        role: 'teacher'
      })
      .select('_id name fullName subject assignedClasses email phone')
      .lean();
      
      console.log('👨‍🏫 Found teachers (all):', teachers.length);
    }

    // 3) מפורמט יפה לפרונט
    const result = teachers.map(t => ({
      _id: String(t._id),
      name: t.fullName || t.name || 'מורה',
      subject: t.subject || '',
      assignedClasses: t.assignedClasses || [],
      email: t.email || '',
      phone: t.phone || ''
    }));
    
    console.log('✅ Returning teachers:', result.length);
    return result;
    
  } catch (error) {
    console.error('❌ Error in getTeachersForParent:', error);
    throw error;
  }
};

// מפענח Authorization header ומחזיר ObjectId / string של ההורה
function parentIdFromAuthHeader(authHeader) {
  if (!authHeader) {
    const err = new Error('Authorization header is required');
    err.status = 401;
    throw err;
  }
  const raw = String(authHeader).replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }
  const id = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!id) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
}

// החזרת פגישות של הורה מהטוקן, מסונן לפי type='meeting', receiverId, ו-createdAt לפי days
exports.getParentMeetingsByToken = async (authHeader, days = 7) => {
  const parentId = parentIdFromAuthHeader(authHeader);

  const since = new Date();
  since.setHours(0,0,0,0);
  since.setDate(since.getDate() - (Number.isFinite(days) ? Number(days) : 7));

  const rows = await Communication.find(
    {
      type: 'meeting',
      receiverId: parentId,
      createdAt: { $gte: since },
    },
    {
      subject: 1,
      content: 1,
      meetingType: 1,
      meetingDate: 1,
      createdAt: 1,
    }
  ).sort({ meetingDate: -1, createdAt: -1 }).lean();

  // נרמול "זום"/"פרונטלי" בעברית בלבד
  const normalizeTypeHe = (t) => {
    const s = String(t || '');
    if (s.includes('זום')) return 'זום';
    if (s.includes('פרונטלי')) return 'פרונטלי';
    return 'פרונטלי';
  };

  return rows.map(r => ({
    id: String(r._id),
    meetingType: normalizeTypeHe(r.meetingType),
    subject: r.subject || r.content || '',
    meetingDate: r.meetingDate || null,
    createdAt: r.createdAt,
    date: r.meetingDate || r.createdAt, // לשימוש נוח בפרונט
  }));
};
