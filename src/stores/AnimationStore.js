import React from 'react';
import rework from 'rework';
import difference from 'lodash/difference';
import last from 'lodash/last';
import { uniqueNamesGenerator } from 'unique-names-generator';

import {
  getPropDefinitionFromCSSName,
  getPropDefinitionFromName,
  getPropDefinitionList
} from '../utils/cssProps';
import { getPointAtTime } from '../utils/easing';
import db from '../utils/db';
import { normalizeTime } from '../utils/time';

const createAnimation = ({ name = undefined, offset = { x: 0, y: 0 } }) => {
  return {
    name: name || uniqueNamesGenerator('-', true),
    offset,
    cssPropGroups: []
  }
}

const createTween = ({ animId, definition, easing = 'linear', lerp, name }) => {
  return {
    animId,
    definition,
    easing,
    lerp,
    name
  }
}

const createKeyframe = ({ animId, tweenId, time, value }) => {
  return {
    animId,
    tweenId,
    time,
    value
  };
}

const fromCSSString = cssString => {
  // mutable lists
  const animations = [];
  const keyframes = [];
  const tweens = [];

  rework(cssString, {
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseValue: true,
    parseCustomProperty: true,
  }).use((node, fn) => {
    node.rules.forEach(rule => {

      if (rule.keyframes) {

        const anim = db.createOne(animations, createAnimation({ name: rule.name }), true).item;

        // each percent declaration
        rule.keyframes.forEach(keyframe => {

          // get ratios from percent strings
          const times = keyframe
            .values
            .map(v => {
              if (v === 'from') return 0;
              if (v === 'to') return 1;
              return parseFloat(v) / 100;
            });

          // each "prop: value" pair
          keyframe.declarations.forEach(decl => {

            // e.g. background-color
            const cssName = decl.property;

            const definition = getPropDefinitionFromCSSName(cssName);
            if (!definition) {
              console.warn(`Definition for CSS prop not yet supported: ${cssName}`);
              return; // EARLY EXIT
            }

            // e.g. 100px => 100
            const value = definition.parse(decl.value);

            // get tween with definition
            let tween = db.getOne(tweens, t => t.definition === definition).item;
            if (!tween) {
              // create tween with definition
              tween = db.createOne(tweens, createTween({
                animId: anim.id,
                definition
              }), true).item;
            }

            times.forEach(time => {

              let keyframe = db.getOne(keyframes, kf => kf.tweenId === tween.id && kf.time === time).item
              if (!keyframe) {
                keyframe = db.createOne(keyframes, createKeyframe({
                  animId: anim.id,
                  tweenId: tween.id,
                  time,
                  value
                }), true).item;
              }
            });
          })
        });
      }
    });
  });

  return { animations, keyframes, tweens };
}

const Context = React.createContext();
export default class AnimationStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    animations: [],
    keyframes: [],
    tweens: []
  }

  importAnimations = (cssString, replace = false) => {
    let { animations, keyframes, tweens } = fromCSSString(cssString);

    if (!replace) {
      animations = [...this.state.animations, ...animations];
      keyframes = [...this.state.keyframes, ...keyframes];
      tweens = [...this.state.tweens, ...tweens];
    }

    this.setState({ animations, keyframes, tweens });
  }

  // CREATE - Animation
  createAnimation = () => {
    const { list: animations, item, index } = db.createOne(this.state.animations, createAnimation({
      offset: { x: 0, y: 0 }
    }));

    this.setState({ animations });

    return {
      anim: item,
      animIndex: index
    }
  }

  // DELETE - Animation
  removeAnimation = (animId) => {
    const { list: animations, item, index } = db.deleteOne(this.state.animations, animId);
    const { list: tweens } = db.deleteMany(this.state.tweens, tween => tween.animId === animId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.animId === animId);

    this.setState({
      animations,
      tweens,
      keyframes
    });

    return {
      animations,
      anim: item,
      animIndex: index
    };
  }

  setAnimationOffset = (animId, offset = { x: 0, y: 0 }) => {
    const { list: animations, item, index } = db.setOne(this.state.animations, animId, { offset });

    this.setState({ animations });

    return {
      anim: item,
      animIndex: index
    };
  }

  // CREATE - Tween
  createTween = (animId, propName) => {

    const definition = getPropDefinitionFromName(propName);

    // ensure definition and prevent duplicates
    if (
      !definition ||
      db.getOne(this.state.tweens, t => t.animId === animId && t.definition === definition).item
    ) {
      return {
        tween: null,
        tweenIndex: -1
      };
    }

    const { list: tweens, item, index } = db.createOne(this.state.tweens, createTween({
      animId,
      definition,
      name: definition.name,
      lerp: definition.lerp
    }))

    this.setState({ tweens });

    // SAMPLE
    // {
    //   const keyframes = [...this.state.keyframes];

    //   db.createOne(keyframes, createKeyframe({
    //     animId,
    //     tweenId: item.id,
    //     time: 0.2,
    //     //value: 20
    //     value: '#00ff00'
    //   }), true);

    //   db.createOne(keyframes, createKeyframe({
    //     animId,
    //     tweenId: item.id,
    //     time: 0.8,
    //     //value: 80
    //     value: '#ff0000'
    //   }), true)

    //   this.setState({ keyframes });
    // }

    return {
      tween: item,
      tweenIndex: index
    };
  }

  // DELETE - Tween
  removeTween = (tweenId) => {
    const { list: tweens, item, index } = db.deleteOne(this.state.tweens, tweenId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.tweenId === tweenId);

    this.setState({ keyframes, tweens });

    return {
      tween: item,
      tweenIndex: index
    }
  }

  createKeyframe = (tweenId, time, value) => {
    time = normalizeTime(time);

    const tween = this.getTween(tweenId);

    // ensure tween and prevent duplicate keyframe time
    if (
      !tween ||
      this.getKeyframeAtTime(tweenId, time)
    ) {
      return {
        keyframe: null,
        keyframeIndex: -1
      }
    }

    const { list: keyframes, item, index } = db.createOne(this.state.keyframes, createKeyframe({
      animId: tween.animId,
      tweenId,
      time,
      value
    }))

    this.setState({ keyframes });

    return {
      keyframe: item,
      keyframeIndex: index
    };
  }

  setKeyframeTime = (keyframeId, time) => {
    time = normalizeTime(time);

    const { list: keyframes, item, index } = db.setOne(this.state.keyframes, keyframeId, { time });

    this.setState({ keyframes });

    return {
      keyframe: item,
      keyframeIndex: index
    };
  }

  setKeyframeValue = (keyframeId, value) => {
    const { list: keyframes, item, index } = db.setOne(this.state.keyframes, keyframeId, { value });

    this.setState({ keyframes });
    return {
      keyframe: item,
      keyframeIndex: index
    };
  }

  setKeyframeValueAtTime = (tweenId, time, value) => {
    const keyframe = this.getKeyframeAtTime(tweenId, time);
    return keyframe ?
      this.setKeyframeValue(keyframe.id, value) :
      this.createKeyframe(tweenId, time, value);
  }

  setTweenPosition = (tweenId, time) => {
    return;
    // const keyframes = this._getKeyframes(tweenId);

    // const time0 = keyframes[0].time;

    // const diff = last(keyframes).time - keyframes[0].time;

    // const clampedTime = clamp(time, 0, 1 - diff);

    // this.setState({
    //   keyframes: {
    //     $set: this.state.keyframes.map(keyframe => {

    //     })
    //   }
    // });
  }

  interpolate = (tweenId, time) => {
    const tween = this.getTween(tweenId);
    if (!tween) return undefined;

    const keyframes = this.getKeyframes(tweenId);

    // early exit if no keyframes
    if (keyframes.length === 0) return undefined;
    if (keyframes.length === 1) return keyframes[0].value;

    if (time <= keyframes[0].time) return keyframes[0].value;
    if (time >= last(keyframes).time) return last(keyframes).value;

    let kf0, kf1;
    for (let i = 0; i < keyframes.length - 1; ++i) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        kf0 = keyframes[i];
        kf1 = keyframes[i + 1];
        break;
      }
    }

    if (!kf0 || !kf1) { console.error('This should never happen!'); }

    const { time: fromTime, value: fromValue } = kf0;
    const { time: toTime, value: toValue } = kf1;

    const span = toTime - fromTime;
    if (span <= 0) return fromValue; // prevent divide-by-zero

    // interpolate
    const scaledTime = (time - fromTime) / span;
    const { y: curvedTime } = getPointAtTime(scaledTime, tween.easing);

    return tween.definition.lerp(fromValue, toValue, curvedTime);
  }

  getUnusedPropDefinitions = (animId) => {
    if (animId === -1) {
      return [];
    }

    return difference(
      getPropDefinitionList(),
      this.getTweens(animId).map(t => t.definition)
    );
  }

  getAnimation = animId => {
    return db.getOne(this.state.animations, animId).item;
  }

  getAnimations = () => {
    return [...this.state.animations];
  }

  getTween = tweenId => {
    return db.getOne(this.state.tweens, tweenId).item;
  }

  getTweens = animId => {
    return db.getMany(this.state.tweens, t => t.animId === animId).items;
  }

  getKeyframe = keyframeId => {
    return db.getOne(this.state.keyframes, keyframeId).item;
  }

  getKeyframeAtTime = (tweenId, time) => {
    time = normalizeTime(time);
    return db.getOne(this.state.keyframes, kf => kf.tweenId === tweenId && kf.time === time).item;
  }

  getKeyframes = tweenId => {
    return db.getMany(this.state.keyframes, kf => kf.tweenId === tweenId)
      .items
      .sort((a, b) => a.time < b.time ? -1 : 1); // sort by time
  }

  render() {
    return (
      <Context.Provider
        value={{
          importAnimations: this.importAnimations,

          createAnimation: this.createAnimation, // CREATE
          setAnimationOffset: this.setAnimationOffset,
          removeAnimation: this.removeAnimation, // DELETE

          createTween: this.createTween, // CREATE
          setTweenPosition: this.setTweenPosition,
          removeTween: this.removeTween, // DELETE

          createKeyframe: this.createKeyframe, // CREATE
          // TODO: DELETE

          setKeyframeTime: this.setKeyframeTime,
          setKeyframeValue: this.setKeyframeValue,
          setKeyframeValueAtTime: this.setKeyframeValueAtTime,

          getAnimation: this.getAnimation,
          getAnimations: this.getAnimations,

          getTween: this.getTween,
          getTweens: this.getTweens,

          getKeyframe: this.getKeyframe, // READ
          getKeyframeAtTime: this.getKeyframeAtTime,
          getKeyframes: this.getKeyframes,

          getUnusedPropDefinitions: this.getUnusedPropDefinitions,

          interpolate: this.interpolate
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}