import { React } from 'common';

import { color } from '@sqs/utils';
import format from './format';

export default {
  color: v => {
    const { alpha, ...rgb } = v;
    const hex = color.stringifyColor(rgb, 'hex');
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: format.color(v),
          color: color.isDark(v) ? '#fff' : '#000'
        }}
      >
        {hex}<br />({alpha})
      </div>
    );
  },
  easing: v => {
    return typeof v === 'string' ?
      v :
      `(${v[0]}, ${v[1]}) (${v[2]}, ${v[3]})`;
  },
  float: v => {
    return `${v}`;
  },
  image: v => {
    return <img alt="" style={{ height: '100%', width: '100%', objectFit: 'contain' }} src={v} />;
  },
  milliseconds: v => {
    return `${v}ms`
  },
  pixels: v => {
    return `${v}px`;
  }
}