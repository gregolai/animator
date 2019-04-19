import {
  createColorProps
} from './utils';

export default {
  backgroundColor: {
    ...createColorProps('backgroundColor', 'background-color'),
  },
  // backgroundPosition: {
  //   ...createColorProps('backgroundPosition', 'background-position', '#ffffff'),
  // },
  // backgroundSize: {
  //   ...createColorProps('backgroundSize', 'background-size')
  // }
}