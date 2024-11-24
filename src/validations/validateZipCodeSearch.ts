export function validateZipCodeSearch(zipCode: string) {
  // Check if the length is exactly 4
  if (zipCode.length !== 4) {
    throw new Error('Invalid Danish zip code');
  }

  // Check if the zip code is a valid number (composed only of digits)
  if (!/^\d{4}$/.test(zipCode)) {
    throw new Error('Invalid Danish zip code');
  }
}
