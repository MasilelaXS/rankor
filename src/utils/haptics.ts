// Haptic Feedback Utility for Mobile App
export class HapticFeedback {
  private static isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  // Light vibration for UI interactions
  static light(): void {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  }

  // Medium vibration for important actions
  static medium(): void {
    if (this.isSupported()) {
      navigator.vibrate(20);
    }
  }

  // Heavy vibration for alerts or errors
  static heavy(): void {
    if (this.isSupported()) {
      navigator.vibrate(50);
    }
  }

  // Success pattern vibration
  static success(): void {
    if (this.isSupported()) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  // Error pattern vibration
  static error(): void {
    if (this.isSupported()) {
      navigator.vibrate([20, 100, 20, 100, 20]);
    }
  }

  // Selection vibration for tab switches
  static selection(): void {
    if (this.isSupported()) {
      navigator.vibrate(15);
    }
  }

  // Custom vibration pattern
  static custom(pattern: number | number[]): void {
    if (this.isSupported()) {
      navigator.vibrate(pattern);
    }
  }
}

export default HapticFeedback;