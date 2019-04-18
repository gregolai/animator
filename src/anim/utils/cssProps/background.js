import {
  createColorProps
} from './utils';

export default {
  backgroundColor: {
    ...createColorProps('backgroundColor', 'background-color'),
  },
  backgroundPosition: {
    ...createColorProps('backgroundPosition', 'background-position'),
  },
  backgroundSize: {
    ...createColorProps('backgroundSize', 'background-size')
  }
}