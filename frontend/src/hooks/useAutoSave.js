import { useState, useEffect, useRef } from 'react';

/**
 * Auto-save hook for form data using localStorage
 * Prevents data loss during crashes, blue screens, or accidental page refreshes
 * 
 * @param {string} key - Unique key for localStorage
 * @param {any} initialValue - Initial value for the form data
 * @param {number} saveInterval - Auto-save interval in milliseconds (default: 5000ms)
 * @returns {Array} [value, setValue, isSaved, clearSavedData]
 */
export function useAutoSave(key, initialValue, saveInterval = 5000) {
  const [value, setValue] = useState(() => {
    // Try to load from localStorage on mount
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`[AutoSave] Restored data for "${key}":`, parsed);
        return parsed;
      }
    } catch (error) {
      console.warn(`[AutoSave] Failed to load saved data for "${key}":`, error);
    }
    return initialValue;
  });

  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef(null);
  const lastValueRef = useRef(value);

  // Save to localStorage when value changes
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if value hasn't changed
    if (JSON.stringify(value) === JSON.stringify(lastValueRef.current)) {
      return;
    }

    // Debounced save to avoid excessive writes
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        lastValueRef.current = value;
        setIsSaved(true);
        console.log(`[AutoSave] Saved data for "${key}"`);
        
        // Reset saved indicator after 2 seconds
        setTimeout(() => setIsSaved(false), 2000);
      } catch (error) {
        console.error(`[AutoSave] Failed to save data for "${key}":`, error);
      }
    }, 1000); // 1 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [key, value]);

  // Periodic auto-save even without changes (backup mechanism)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`[AutoSave] Periodic backup for "${key}"`);
      } catch (error) {
        console.error(`[AutoSave] Failed periodic save for "${key}":`, error);
      }
    }, saveInterval);

    return () => clearInterval(interval);
  }, [key, value, saveInterval]);

  // Function to clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(key);
      console.log(`[AutoSave] Cleared saved data for "${key}"`);
    } catch (error) {
      console.error(`[AutoSave] Failed to clear data for "${key}":`, error);
    }
  };

  return [value, setValue, isSaved, clearSavedData];
}

/**
 * Auto-save hook for multiple form fields
 * Useful for complex forms with multiple sections
 * 
 * @param {string} prefix - Prefix for localStorage keys
 * @param {object} initialValues - Initial values for all fields
 * @param {number} saveInterval - Auto-save interval in milliseconds
 * @returns {object} Object with auto-save enabled state setters
 */
export function useAutoSaveForm(prefix, initialValues, saveInterval = 5000) {
  const [formData, setFormData] = useState(() => {
    const savedData = {};
    Object.keys(initialValues).forEach(key => {
      try {
        const fullKey = `${prefix}_${key}`;
        const saved = localStorage.getItem(fullKey);
        if (saved) {
          savedData[key] = JSON.parse(saved);
          console.log(`[AutoSaveForm] Restored field "${key}":`, savedData[key]);
        } else {
          savedData[key] = initialValues[key];
        }
      } catch (error) {
        console.warn(`[AutoSaveForm] Failed to load field "${key}":`, error);
        savedData[key] = initialValues[key];
      }
    });
    return savedData;
  });

  const [savedFields, setSavedFields] = useState(new Set());

  // Create setters for each field with auto-save
  const setters = {};
  Object.keys(initialValues).forEach(key => {
    setters[key] = (newValue) => {
      const fullKey = `${prefix}_${key}`;
      setFormData(prev => ({ ...prev, [key]: newValue }));
      
      try {
        localStorage.setItem(fullKey, JSON.stringify(newValue));
        setSavedFields(prev => new Set([...prev, key]));
        console.log(`[AutoSaveForm] Saved field "${key}"`);
        
        // Remove from saved set after 2 seconds
        setTimeout(() => {
          setSavedFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        }, 2000);
      } catch (error) {
        console.error(`[AutoSaveForm] Failed to save field "${key}":`, error);
      }
    };
  });

  // Function to clear all saved form data
  const clearSavedData = () => {
    Object.keys(initialValues).forEach(key => {
      try {
        const fullKey = `${prefix}_${key}`;
        localStorage.removeItem(fullKey);
      } catch (error) {
        console.error(`[AutoSaveForm] Failed to clear field "${key}":`, error);
      }
    });
    console.log(`[AutoSaveForm] Cleared all saved data for prefix "${prefix}"`);
  };

  // Function to reset form to initial values
  const resetForm = () => {
    setFormData(initialValues);
    clearSavedData();
  };

  return {
    formData,
    setters,
    savedFields,
    clearSavedData,
    resetForm
  };
}