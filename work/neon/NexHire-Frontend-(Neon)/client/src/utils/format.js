/**
 * Number formatting utilities — prevents long-decimal display.
 * PostgreSQL NUMERIC type returns values like 0.880000000000000000000
 * or 100.0000000000000000. These helpers round them for display.
 */

/**
 * Format a number to a fixed number of decimal places.
 * Handles strings, numbers, null, undefined.
 * @param {*} value - The value to format
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted number, or '—' if null/undefined
 */
export function formatNumber(value, decimals = 1) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return num.toFixed(decimals);
}

/**
 * Format a percentage value (0-100 or 0-1).
 * @param {*} value - The value to format
 * @param {boolean} isFraction - If true, value is 0-1 and needs *100
 * @returns {string} Formatted percentage with % sign
 */
export function formatPercent(value, isFraction = false) {
    if (value === null || value === undefined || value === '') return '—';
    let num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    if (isFraction) num = num * 100;
    return Math.round(num * 10) / 10 + '%';
}

/**
 * Format a score value (0-100). Rounds to nearest integer.
 * @param {*} value - The score to format
 * @returns {string} Formatted score
 */
export function formatScore(value) {
    if (value === null || value === undefined || value === '') return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return Math.round(num).toString();
}

/**
 * Format currency.
 * @param {*} value - The amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(num);
}
