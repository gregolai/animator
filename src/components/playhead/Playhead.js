import React from 'react';
import classnames from 'classnames';

import { Canvas, IconButton } from 'components/shared';
import { MediaStore } from 'stores';
import { INTERVAL_MS } from 'utils/constants';

import styles from './Playhead.module.scss';

const TICK_COLOR = '#a1a1a1';
const DURATION_END_COLOR = '#d2d2d2';

class Ticks extends React.Component {
  onResize = ({ cvs, ctx }) => {
    const { width, height } = cvs;
    ctx.clearRect(0, 0, width, height);

    const getHeight = i => {
      if (i % 10 === 0) return 12;
      if (i % 5 === 0) return 8;
      return 4;
    };

    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
    ctx.fillStyle = TICK_COLOR;

    const duration = this.props.duration;
    const spacing = this.props.tickSpacing;

    let x = spacing;
    let i = 1;
    let curTime = INTERVAL_MS;

    while (x < width) {

      if (curTime >= duration) {
        ctx.fillStyle = DURATION_END_COLOR;
        ctx.fillRect(x, 0, width - x, height);
        break;
      }

      const h = getHeight(i);
      const y = height - h;

      ctx.fillRect(x, y, 1, h);

      if (h === 12) {
        const text = `${i / 100}`;
        const measured = ctx.measureText(text);
        ctx.fillText(text, x - (measured.width / 2), y - 4);
      }

      ++i;
      x += spacing;
      curTime += INTERVAL_MS;
    }
  };

  render() {
    const { onMouseDown, onMouseMove, onMouseUp } = this.props;
    return (
      <Canvas
        onResize={this.onResize}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    );
  }
}

const Playhead = ({ className }) => {

  return (
    <MediaStore.Consumer>
      {({ duration, playhead, setPlayhead, setTickSpacing, tickSpacing }) => (
        <div
          className={classnames(styles.container, className)}
        >
          <div className={styles.left}>
            <div className={styles.tickSpacingButtons}>
              <IconButton
                icon="chevronLeft"
                onClick={() => setTickSpacing(tickSpacing - 1)}
              />
              <IconButton
                icon="chevronRight"
                onClick={() => setTickSpacing(tickSpacing + 1)}
              />
            </div>

            <div>spacing: {tickSpacing}</div>

            <div className={styles.timeDisplay}>{playhead}</div>
          </div>

          <div className={styles.right}>
            <Ticks
              duration={duration}
              onMouseDown={({ x, y }) => {

                setPlayhead(x / tickSpacing * INTERVAL_MS);
              }}
              onMouseMove={({ isButtonDown, x, y }) => {
                if (isButtonDown) {
                  setPlayhead(x / tickSpacing * INTERVAL_MS);
                }
              }}
              tickSpacing={tickSpacing}
            />
          </div>

          {/* <input
          className={styles.slider}
          min={0}
          max={1}
          onChange={e => setPlayhead(parseFloat(e.target.value))}
          step={TIME_STEP_SECONDS}
          type="range"
          value={playhead}
        /> */}
        </div>
      )}
    </MediaStore.Consumer>
  );
}

export default Playhead;