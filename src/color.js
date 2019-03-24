const COLOR_CHANNEL_MIN = 0x00, COLOR_CHANNEL_MAX = 0xff;

function clamp(value = COLOR_CHANNEL_MIN) {
  return Math.max(COLOR_CHANNEL_MIN, Math.min(value, COLOR_CHANNEL_MAX));
}

export function channelsToCss(r, g, b) {
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

export const COLORS = {
  black: channelsToCss(COLOR_CHANNEL_MIN, COLOR_CHANNEL_MIN, COLOR_CHANNEL_MIN),
  white: channelsToCss(COLOR_CHANNEL_MAX, COLOR_CHANNEL_MAX, COLOR_CHANNEL_MAX)
};
