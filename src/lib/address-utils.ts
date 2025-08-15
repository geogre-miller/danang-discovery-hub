// Utility function to format addresses consistently across the app
export const formatAddress = (address: string): string => {
  if (!address) return '';
  
  // Remove postal codes (5 digits) and country references
  let cleanAddress = address
    .replace(/,?\s*\d{5}\s*,?/g, '') // Remove postal codes like "50207"
    .replace(/,?\s*Vietnam\s*$/i, '') // Remove "Vietnam" at the end
    .replace(/,?\s*Viet Nam\s*$/i, '') // Remove "Viet Nam" at the end
    .replace(/,?\s*VN\s*$/i, '') // Remove "VN" at the end
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/,\s*$/g, '') // Remove trailing comma
    .replace(/^\s*,/g, '') // Remove leading comma
    .trim();
  
  return cleanAddress;
};

// Get the best available address from a place object
export const getBestAddress = (place: { address?: string; formattedAddress?: string }): string => {
  const primaryAddress = place.formattedAddress || place.address || '';
  return formatAddress(primaryAddress);
};
