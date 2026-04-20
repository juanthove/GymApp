export const lightenColor = (hex, amount = 0.7) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) + (255 - (num >> 16)) * amount;
  let g = ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount;
  let b = (num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount;

  return `rgb(${r}, ${g}, ${b})`;
};

export const darkenColor = (hex, amount = 0.2) => {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) * (1 - amount);
  let g = ((num >> 8) & 0x00ff) * (1 - amount);
  let b = (num & 0x0000ff) * (1 - amount);

  return `rgb(${r}, ${g}, ${b})`;
};