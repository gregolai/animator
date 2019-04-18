import {
  createPixelProps
} from './utils';

export default {
  top: {
    ...createPixelProps('top', 'top'),
  },
  right: {
    ...createPixelProps('right', 'right'),
  },
  bottom: {
    ...createPixelProps('bottom', 'bottom'),
  },
  left: {
    ...createPixelProps('left', 'left'),
  }
}