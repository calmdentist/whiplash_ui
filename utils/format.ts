/**
 * Truncates a Solana address for display purposes
 * @param address The full address to truncate
 * @param startChars Number of characters to keep at the start
 * @param endChars Number of characters to keep at the end
 * @returns Truncated address
 */
export function truncateAddress(address: string, startChars = 4, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats a number with a specified number of decimal places
 * @param value Number to format
 * @param decimals Number of decimal places to display
 * @param minDecimals Minimum number of decimal places to display
 * @returns Formatted number as a string
 */
export function formatNumber(
  value: number | string, 
  decimals = 2, 
  minDecimals = 0
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats an amount based on token decimals
 * @param amount Raw amount (including decimals)
 * @param decimals Number of decimals in the token
 * @param displayDecimals Number of decimals to display
 * @returns Formatted amount as a string
 */
export function formatTokenAmount(
  amount: number | string,
  decimals = 6,
  displayDecimals = 2
): string {
  if (!amount) return '0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const adjustedNum = num / Math.pow(10, decimals);
  
  return formatNumber(adjustedNum, displayDecimals);
} 