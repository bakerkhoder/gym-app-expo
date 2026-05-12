// Date utility functions for membership calculations

const MEMBERSHIP_PERIOD_DAYS = 30;

/**
 * Calculate the due date (30 days after the given date)
 */
export function getDueDate(fromDateString) {
  const from = new Date(fromDateString);
  const due = new Date(from);
  due.setDate(due.getDate() + MEMBERSHIP_PERIOD_DAYS);
  return due;
}

/**
 * Check if payment is due (current date is past the due date)
 */
export function isPaymentDue(lastPaidDateString) {
  if (!lastPaidDateString) return true; // no payment recorded
  const dueDate = getDueDate(lastPaidDateString);
  const now = new Date();
  return now > dueDate;
}

/**
 * Calculate days remaining until payment is due (negative if overdue)
 */
export function daysRemaining(lastPaidDateString) {
  if (!lastPaidDateString) return 0;
  const dueDate = getDueDate(lastPaidDateString);
  const now = new Date();
  const diffMs = dueDate - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format an ISO date string to a readable date (e.g., "May 5, 2026")
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get today's date as an ISO string (without time)
 */
export function todayISO() {
  const d = new Date();
  // Return YYYY-MM-DD
  return d.toISOString().split('T')[0];
}
