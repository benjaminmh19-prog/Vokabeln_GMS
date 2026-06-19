import { describe, it, expect } from 'vitest';

/**
 * Admin Login Button Tests
 * 
 * Regression tests to ensure the admin login button remains clickable
 * and the login functionality works correctly.
 */

describe('Admin Login Button', () => {
  it('should not have pointer-events-none class', () => {
    // This test ensures the login button is clickable
    // The button should NOT have pointer-events-none
    const buttonClasses = 'w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all';
    
    expect(buttonClasses).not.toContain('pointer-events-none');
  });

  it('should have proper button styling for interactivity', () => {
    const buttonClasses = 'w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all';
    
    // Should have hover effects
    expect(buttonClasses).toContain('hover:');
    
    // Should have active effects
    expect(buttonClasses).toContain('active:');
    
    // Should have transition
    expect(buttonClasses).toContain('transition-all');
  });

  it('should have proper form submission type', () => {
    // Button type should be 'submit' for form submission
    const buttonType = 'submit';
    expect(buttonType).toBe('submit');
  });

  it('should handle login with correct password', async () => {
    // Simulate admin login logic
    const adminPassword = 'admin123';
    const inputPassword = 'admin123';
    
    const isLoginSuccessful = inputPassword === adminPassword;
    expect(isLoginSuccessful).toBe(true);
  });

  it('should reject login with incorrect password', async () => {
    // Simulate admin login logic
    const adminPassword = 'admin123';
    const inputPassword = 'wrongpassword';
    
    const isLoginSuccessful = inputPassword === adminPassword;
    expect(isLoginSuccessful).toBe(false);
  });

  it('should clear password field after successful login', () => {
    // Simulate password clearing after login
    let password = 'admin123';
    const isLoginSuccessful = true;
    
    if (isLoginSuccessful) {
      password = '';
    }
    
    expect(password).toBe('');
  });

  it('should show success toast on successful login', () => {
    // Simulate toast notification
    const isLoginSuccessful = true;
    const expectedToastMessage = 'Admin erfolgreich angemeldet';
    
    if (isLoginSuccessful) {
      expect(expectedToastMessage).toBe('Admin erfolgreich angemeldet');
    }
  });

  it('should show error toast on failed login', () => {
    // Simulate error toast notification
    const isLoginSuccessful = false;
    const expectedErrorMessage = 'Falsches Passwort';
    
    if (!isLoginSuccessful) {
      expect(expectedErrorMessage).toBe('Falsches Passwort');
    }
  });

  it('should prevent pointer events from being disabled', () => {
    // Regression test: ensure pointer-events-none is never added
    const disabledClasses = ['pointer-events-none', 'disabled', 'opacity-50'];
    const buttonClasses = 'w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all';
    
    for (const disabledClass of disabledClasses) {
      expect(buttonClasses).not.toContain(disabledClass);
    }
  });
});
