const lerpers = {
  // // https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
  color: (from, to, t) => {
    const ah = parseInt(from.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(to.replace(/#/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + t * (br - ar),
      rg = ag + t * (bg - ag),
      rb = ab + t * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  },

  number: (from, to, t) => {
    return from + t * (to - from);
  }
}

export const lerp = (from, to, t, type) => {
  const lerper = lerpers[type] || lerpers.number;
  return lerper(from, to, t);
}