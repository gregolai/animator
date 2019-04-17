import React from 'react';

import styles from './Canvas.scss';

export default class Canvas extends React.Component {
  state = {
    height: 0,
    width: 0
  };

  _startFrameLoop(onFrame) {
    const cvs = this.cvs;
    const ctx = this.cvs.getContext('2d');
    
    const startTime = Date.now();
    let prevTime = startTime;

    const loop = () => {
      const curTime = Date.now();
      const dt = curTime - prevTime;

      onFrame({
        cvs,
        ctx,
        dt,
        t: curTime - startTime,
      })

      prevTime = curTime;

      this.raf = requestAnimationFrame(loop);
    }
    this.raf = requestAnimationFrame(loop);
  }

  componentDidMount() {
    const observer = new ResizeObserver(els => {
      const { width, height } = els[0].contentRect;
      this.setState({ width, height });
    })
    observer.observe(this.cvs);

    const { onFrame } = this.props;
    if (onFrame) {
      this._startFrameLoop(onFrame);
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  componentDidUpdate() {
    const { onResize } = this.props;
    if (onResize) {
      onResize({
        cvs: this.cvs,
        ctx: this.cvs.getContext('2d')
      });
    }
  }

  captureRef = ref => {
    this.cvs = ref;
  }
  
  render() {
    const { width, height } = this.state;
    return (
      <canvas
        ref={this.captureRef}
        className={styles.canvas}
        height={height}
        width={width}
      ></canvas>
    )
  }
}