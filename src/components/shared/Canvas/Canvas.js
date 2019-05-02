import React from 'react';

import styles from './Canvas.module.scss';

export default class Canvas extends React.Component {
  state = {
    height: 0,
    width: 0
  };

  isButtonDown = false;

  _startFrameLoop(onFrame) {
    const cvs = this.cvs;

    const startTime = Date.now();
    let prevTime = startTime;

    const loop = () => {
      const curTime = Date.now();
      const dt = curTime - prevTime;

      const ctx = cvs.getContext('2d');
      ctx.save();
      onFrame({
        cvs,
        ctx,
        dt,
        t: curTime - startTime
      });
      ctx.restore();

      prevTime = curTime;

      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  componentDidMount() {
    this.observer = new ResizeObserver(els => {
      const { width, height } = els[0].contentRect;
      this.setState({ width, height });
    });
    this.observer.observe(this.cvs);

    const { onFrame } = this.props;
    if (onFrame) {
      this._startFrameLoop(onFrame);
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  componentDidUpdate() {
    const { onResize } = this.props;
    if (onResize) {
      const cvs = this.cvs;
      const ctx = cvs.getContext('2d');
      ctx.save();
      onResize({ cvs, ctx });
      ctx.restore();
    }
  }

  captureRef = ref => {
    this.cvs = ref;
  };

  onMouseDown = e => {
    const { clientX, clientY, button, metaKey, ctrlKey, shiftKey } = e;
    if (button !== 0) return; // left mouse only

    this.isButtonDown = true;

    const { onMouseDown } = this.props;
    if (onMouseDown) {
      const rect = this.cvs.getBoundingClientRect();
      onMouseDown({
        x: clientX - rect.left,
        y: clientY - rect.top,
        button,
        metaKey,
        ctrlKey,
        shiftKey
      });
    }
  };

  onMouseMove = e => {
    const { clientX, clientY } = e;
    const { onMouseMove } = this.props;

    if (onMouseMove) {
      const rect = this.cvs.getBoundingClientRect();
      onMouseMove({
        isButtonDown: this.isButtonDown,
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  onMouseUp = e => {
    const { clientX, clientY, button, metaKey, ctrlKey, shiftKey } = e;
    if (button !== 0) return; // left mouse only

    this.isButtonDown = false;

    const { onMouseUp } = this.props;
    if (onMouseUp) {
      const rect = this.cvs.getBoundingClientRect();
      onMouseUp({
        x: clientX - rect.left,
        y: clientY - rect.top,
        button,
        metaKey,
        ctrlKey,
        shiftKey
      });
    }
  };

  render() {
    const { width, height } = this.state;
    return (
      <canvas
        ref={this.captureRef}
        className={styles.container}
        height={height}
        width={width}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      />
    );
  }
}
