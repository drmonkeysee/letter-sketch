const SINGLE_LINES = {
        179: 0b0101,
        180: 0b1101,
        191: 0b1100,
        192: 0b0011,
        193: 0b1011,
        194: 0b1110,
        195: 0b0111,
        196: 0b1010,
        197: 0b1111,
        217: 0b1001,
        218: 0b0110,
      },
      SINGLE_BEST_FIT = [
        196,  // 0000
        179,  // 0001
        196,  // 0010
        192,  // 0011
        179,  // 0100
        179,  // 0101
        218,  // 0110
        195,  // 0111
        196,  // 1000
        217,  // 1001
        196,  // 1010
        193,  // 1011
        191,  // 1100
        180,  // 1101
        194,  // 1110
        197,  // 1111
      ],
      DOUBLE_LINES = {
        185: 0b1101,
        186: 0b0101,
        187: 0b1100,
        188: 0b1001,
        200: 0b0011,
        201: 0b0110,
        202: 0b1011,
        203: 0b1110,
        204: 0b0111,
        205: 0b1010,
        206: 0b1111,
      },
      DOUBLE_BEST_FIT = [
        205,  // 0000
        186,  // 0001
        205,  // 0010
        200,  // 0011
        186,  // 0100
        186,  // 0101
        201,  // 0110
        204,  // 0111
        205,  // 1000
        188,  // 1001
        205,  // 1010
        202,  // 1011
        187,  // 1100
        185,  // 1101
        203,  // 1110
        206,  // 1111
      ];

class LineSet {
  constructor(lines, bestFit) {
    this.lines = lines;
    this.bestFit = bestFit;
  }

  getId(constraints) {
    return this.bestFit[constraints];
  }

  hasAttractor(glyphId, direction) {
    return Boolean(this.lines[glyphId] & direction);
  }
}

const singleLineSet = new LineSet(SINGLE_LINES, SINGLE_BEST_FIT),
      doubleLineSet = new LineSet(DOUBLE_LINES, DOUBLE_BEST_FIT);

export const DIRECTIONS = {
  NONE: 0b0000,
  TOP: 0b0001,
  RIGHT: 0b0010,
  BOTTOM: 0b0100,
  LEFT: 0b1000,
};

export function getLineSet(glyphId) {
  if (SINGLE_LINES[glyphId]) return singleLineSet;
  if (DOUBLE_LINES[glyphId]) return doubleLineSet;
  return null;
}

export function hasAttractor(glyphId, direction) {
  return Boolean(getLineSet(glyphId)?.hasAttractor(glyphId, direction));
}
