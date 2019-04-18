
import {
  createProp,
  createPixelProps,
  lerps,
  toPx
} from './utils';

export default {
  margin: {
    ...createProp('margin', 'margin'),

    format: v => {
      const [top, right, bottom, left] = v;
      return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
    },
    lerp: (from, to, t) => {
      const [top0, right0, bottom0, left0] = from;
      const [top1, right1, bottom1, left1] = to;

      const top = lerps.number(top0, top1, t);
      const right = lerps.number(right0, right1, t);
      const bottom = lerps.number(bottom0, bottom1, t);
      const left = lerps.number(left0, left1, t);

      return [top, right, bottom, left];
    },
    parse: v => {
      if (typeof v === 'string') {
        v = v.split(' ');
      } else {
        v = [v, v, v, v];
      }

      // Make every element a number (assume px for now)
      v = v.map(x => parseFloat(x));

      switch (v.length) {
        case 1:
          return [v[0], v[0], v[0], v[0]]; // Apply to all four sides
        case 2:
          return [v[0], v[1], v[0], v[1]]; // vertical | horizontal
        case 3:
          return [v[0], v[1], v[2], v[1]]; // top | horizontal | bottom
        default:
          return [v[0], v[1], v[2], v[3]];
      }
    }
  },
  marginTop: {
    ...createPixelProps('marginTop', 'margin-top')
  },
  marginRight: {
    ...createPixelProps('marginRight', 'margin-right')
  },
  marginBottom: {
    ...createPixelProps('marginBottom', 'margin-bottom')
  },
  marginLeft: {
    ...createPixelProps('marginLeft', 'margin-left')
  }
}