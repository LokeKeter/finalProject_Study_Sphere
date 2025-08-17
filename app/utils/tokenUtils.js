import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * JWT Token Utility Functions
 */

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for reading payload data, not for security verification
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get user data from stored JWT token
 */
export const getUserFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;
    
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    
    return {
      id: decoded.id,
      fullName: decoded.fullName,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Get specific field from JWT token
 */
export const getTokenField = async (fieldName) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;
    
    const decoded = decodeJWT(token);
    return decoded ? decoded[fieldName] : null;
  } catch (error) {
    console.error(`Error getting ${fieldName} from token:`, error);
    return null;
  }
};

/**
 * Verify token contains required fields
 */
export const verifyTokenFields = async () => {
  try {
    const user = await getUserFromToken();
    if (!user) return { valid: false, missing: ['token'] };
    
    const requiredFields = ['id', 'fullName', 'email', 'role'];
    const missing = requiredFields.filter(field => !user[field]);
    
    return {
      valid: missing.length === 0,
      missing,
      user
    };
  } catch (error) {
    console.error('Error verifying token fields:', error);
    return { valid: false, missing: ['error'], error: error.message };
  }
};
