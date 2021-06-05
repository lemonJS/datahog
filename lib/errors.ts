export class MaxAttemptsReachedError extends Error {
  public constructor(message = 'Max attempts reached') {
    super(message);
    this.name = 'MaxAttemptsReachedError';
  }
}

export class BillProviderUnavailableError extends Error {
  public constructor(message = 'Bill provider unavailable') {
    super(message);
    this.name = 'BillProviderUnavailableError';
  }
}

export class CallbackUrlUnavailableError extends Error {
  public constructor(message = 'Callback URL unavailable') {
    super(message);
    this.name = 'CallbackUrlUnavailableError';
  }
} 
