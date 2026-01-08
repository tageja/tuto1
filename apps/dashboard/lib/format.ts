export function formatVND(amount: number) {
  // Format as currency, assuming input is in thousands (e.g. 500 -> 500,000)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount * 1000);
}

export function formatSchoolTuition(amount: number) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}M ₫`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}
