import { createColorProps } from './utils';

export default {
  backgroundColor: createColorProps({
    name: 'backgroundColor',
    cssName: 'background-color',
    render: {}
  })
  // backgroundPosition: {
  //   ...createColorProps('backgroundPosition', 'background-position', '#ffffff'),
  // },
  // backgroundSize: {
  //   ...createColorProps('backgroundSize', 'background-size')
  // }
}