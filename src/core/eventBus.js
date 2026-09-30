/**
 * Simple Event Bus for Decoupled Component Communication
 * Follows Publish-Subscribe pattern.
 */
class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(callback);

    // Return an easy unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName 
   * @param {Function} callback 
   */
  off(eventName, callback) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(callback);
    }
  }

  /**
   * Emit an event with data
   * @param {string} eventName 
   * @param {*} data 
   */
  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in listener for "${eventName}":`, error);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
