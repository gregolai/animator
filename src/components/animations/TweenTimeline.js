import { React, cx } from 'utils';

import { } from 'stores';
import { Ticks } from 'components/shared';

import styles from './TweenTimeline.module.scss';


const TweenTimeline = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <Ticks.EvenSpaced
        count={100}
        ticks={[
          { mod: 10, height: 12, color: '#c1c1c1' },
          { mod: 5, height: 8, color: '#c1c1c1' },
          { mod: 1, height: 4, color: '#c1c1c1' }
        ]}
      />
    </div>
  )
}

export default TweenTimeline;