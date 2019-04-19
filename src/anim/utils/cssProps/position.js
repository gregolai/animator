import { createPixelProps } from './utils';

const createProps = (name, cssName) => createPixelProps({
  name,
  cssName,
  render: {
    min: -500,
    max: 500
  }
})

export default {
  top: createProps('top', 'top'),
  right: createProps('right', 'right'),
  bottom: createProps('bottom', 'bottom'),
  left: createProps('left', 'left')
}