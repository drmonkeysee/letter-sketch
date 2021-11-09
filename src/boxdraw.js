const SINGLE_LINES = {
        179: 0b1010,
        180: 0b1110,
        191: 0b1100,
        192: 0b0011,
        193: 0b0111,
        194: 0b1101,
        195: 0b1011,
        196: 0b0101,
        197: 0b1111,
        217: 0b0110,
        218: 0b1001,
      },
      SINGLE_BEST_FIT = [
        196,  // 0000
        196,  // 0001
        179,  // 0010
        192,  // 0011
        196,  // 0100
        196,  // 0101
        217,  // 0110
        193,  // 0111
        179,  // 1000
        218,  // 1001
        179,  // 1010
        195,  // 1011
        191,  // 1100
        194,  // 1101
        180,  // 1110
        197,  // 1111
      ],
      DOUBLE_LINES = {
        185: 0b1110,
        186: 0b1010,
        187: 0b1100,
        188: 0b0110,
        200: 0b0011,
        201: 0b1001,
        202: 0b0111,
        203: 0b1101,
        204: 0b1011,
        205: 0b0101,
        206: 0b1111,
      },
      DOUBLE_BEST_FIT = [
        205,  // 0000
        205,  // 0001
        186,  // 0010
        200,  // 0011
        205,  // 0100
        205,  // 0101
        188,  // 0110
        202,  // 0111
        186,  // 1000
        201,  // 1001
        186,  // 1010
        204,  // 1011
        187,  // 1100
        203,  // 1101
        185,  // 1110
        206,  // 1111
      ],
      DOUBLE_H_LINES = {
        179: 0b1010,
        181: 0b1110,
        184: 0b1100,
        190: 0b0110,
        198: 0b1011,
        205: 0b0101,
        207: 0b0111,
        209: 0b1101,
        212: 0b0011,
        213: 0b1001,
        216: 0b1111,
      },
      DOUBLE_H_BEST_FIT = [
        205,  // 0000
        205,  // 0001
        179,  // 0010
        212,  // 0011
        205,  // 0100
        205,  // 0101
        190,  // 0110
        207,  // 0111
        179,  // 1000
        213,  // 1001
        179,  // 1010
        198,  // 1011
        184,  // 1100
        209,  // 1101
        181,  // 1110
        216,  // 1111
      ],
      DOUBLE_V_LINES = {
        182: 0b1110,
        183: 0b1100,
        186: 0b1010,
        189: 0b0110,
        196: 0b0101,
        199: 0b1011,
        208: 0b0111,
        210: 0b1101,
        211: 0b0011,
        214: 0b1001,
        215: 0b1111,
      },
      DOUBLE_V_BEST_FIT = [
        196,  // 0000
        196,  // 0001
        186,  // 0010
        211,  // 0011
        196,  // 0100
        196,  // 0101
        189,  // 0110
        208,  // 0111
        186,  // 1000
        214,  // 1001
        186,  // 1010
        199,  // 1011
        183,  // 1100
        210,  // 1101
        182,  // 1110
        215,  // 1111
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
      doubleLineSet = new LineSet(DOUBLE_LINES, DOUBLE_BEST_FIT),
      doubleHLineSet = new LineSet(DOUBLE_H_LINES, DOUBLE_H_BEST_FIT),
      doubleVLineSet = new LineSet(DOUBLE_V_LINES, DOUBLE_V_BEST_FIT);

export const DIRECTIONS = {
  NONE: 0b0000,
  RIGHT: 0b0001,
  TOP: 0b0010,
  LEFT: 0b0100,
  BOTTOM: 0b1000,
  complement(direction) {
    return direction > 2 ? direction >> 2 : direction << 2;
  },
  // NOTE: convert horizontal to vertical and vice-versa;
  // i.e. phase-shift between sine and cosine.
  rotate(direction) {
    switch (direction) {
      case DIRECTIONS.RIGHT:
      case DIRECTIONS.TOP:
      case DIRECTIONS.LEFT:
        return direction << 1;
      case DIRECTIONS.BOTTOM:
        return DIRECTIONS.RIGHT;
      default:
        return direction;
    }
  },
};

export function getLineSet(glyphId) {
  if (SINGLE_LINES[glyphId]) return singleLineSet;
  if (DOUBLE_LINES[glyphId]) return doubleLineSet;
  if (DOUBLE_H_LINES[glyphId]) return doubleHLineSet;
  if (DOUBLE_V_LINES[glyphId]) return doubleVLineSet;
  return null;
}

export function hasAttractor(glyphId, direction) {
  return Boolean(getLineSet(glyphId)?.hasAttractor(glyphId, direction));
}

/*
 * Interpolate best line set fit between the primary (currently-drawn) glyph's
 * line set and the neighbor's line set for the given direction, where the
 * primary line set takes precedence over the neighbor line set.
 *
 * Vertical Direction
 * +---------+---------+---------+---------+---------+
 * |  n\p    | single  | double  | doubleV | doubleH |
 * +---------+---------+---------+---------+---------+
 * | single  | single  | doubleV | doubleV | single  |
 * | double  | doubleH | double  | double  | doubleH |
 * | doubleV | single  | doubleV | doubleV | single  |
 * | doubleH | doubleH | double  | double  | doubleH |
 * +---------+---------+---------+---------+---------+
 *
 * Horizontal Direction
 * +---------+---------+---------+---------+---------+
 * |  n\p    | single  | double  | doubleH | doubleV |
 * +---------+---------+---------+---------+---------+
 * | single  | single  | doubleH | doubleH | single  |
 * | double  | doubleV | double  | double  | doubleV |
 * | doubleH | single  | doubleH | doubleH | single  |
 * | doubleV | doubleV | double  | double  | doubleV |
 * +---------+---------+---------+---------+---------+
 *
 * Note that single and doubleH have the same effect in the vertical direction
 * while single and doubleV have the same effect in the horizontal direction,
 * and vice-versa for the other two corresponding line sets. These effects are
 * expressed as the single and double "counterparts" in the function below.
 */

export function interpolateLineSet(lineSet, direction, neighborGlyph) {
  const nLineSet = getLineSet(neighborGlyph);
  let singleCounterPart = null,
      doubleCounterPart = null;
  switch (direction) {
    case DIRECTIONS.TOP:
    case DIRECTIONS.BOTTOM:
      singleCounterPart = doubleHLineSet;
      doubleCounterPart = doubleVLineSet;
      break;
    case DIRECTIONS.RIGHT:
    case DIRECTIONS.LEFT:
      singleCounterPart = doubleVLineSet;
      doubleCounterPart = doubleHLineSet;
      break;
  }
  if (!singleCounterPart) return null;

  switch (lineSet) {
    case singleLineSet:
    case singleCounterPart:
      switch (nLineSet) {
        case singleLineSet:
        case doubleCounterPart:
          return singleLineSet;
        case doubleLineSet:
        case singleCounterPart:
          return singleCounterPart;
      }
      break;
    case doubleLineSet:
    case doubleCounterPart:
      switch (nLineSet) {
        case singleLineSet:
        case doubleCounterPart:
          return doubleCounterPart;
        case doubleLineSet:
        case singleCounterPart:
          return doubleLineSet;
      }
      break;
  }
  return null;
}
