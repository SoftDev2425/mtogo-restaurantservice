export function validateZipCodeSearch(zipCode: string) {
  const regex = /^[0-9]{4}$/; // Ensure exactly 4 numeric digits
  if (!regex.test(zipCode)) {
    throw new Error('Invalid Danish zip code');
  }
}
