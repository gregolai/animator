import React from 'react';
import rework from 'rework';
import difference from 'lodash/difference';
import {
  getPropDefinitionFromCSSName,
  getPropDefinitionFromName,
  getPropDefinitionList
} from './utils/cssProps';

import uid from 'uid';
import { uniqueNamesGenerator } from 'unique-names-generator';

import db from './utils/db';

const createAnimation = ({ name = undefined, offset = { x: 0, y: 0 } }) => {
  return {
    name: name || uniqueNamesGenerator('-', true),
    offset,
    cssPropGroups: []
  }
}

const createTween = ({ animId, definition, easing = 'linear', lerp, name }) => {
  const id = uid(8);
  return {
    animId,
    id,
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
    id: uid(8),
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
                definition,
                // TODO
                name: definition.name,
                lerp: definition.lerp
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
    console.log({ animations, keyframes, tweens })
    if (!replace) {
      animations = [...this.state.animations, ...animations];
      keyframes = [...this.state.keyframes, ...keyframes];
      tweens = [...this.state.tweens, ...tweens];
    }
    this.setState({ animations, keyframes, tweens });
  }

  // CREATE - Animation
  addAnimation = () => {
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
  addTween = (animId, propName) => {

    const definition = getPropDefinitionFromName(propName);

    // ensure definition and prevent duplicates
    if (
      !definition ||
      db.getOne(this.state.tweens, t => t.definition === definition).item
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

  addKeyframe = (tweenId, time, value) => {

    const { item: tween } = db.getOne(this.state.tweens, tweenId);

    // ensure tween and prevent duplicate keyframe time
    if (
      !tween ||
      db.getOne(this.state.keyframes,
        kf => kf.tweenId === tweenId && kf.time === time
      ).item
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

  getTweens = (animId) => {
    return this.state.tweens.filter(t => t.animId === animId);
  }

  /**
   * Get keyframes for tween, sorted by time
   */
  getKeyframes = (tweenId) => {
    const { items } = db.getMany(this.state.keyframes, kf => kf.tweenId === tweenId);
    return items.sort((a, b) => a.time < b.time ? -1 : 1);
  }

  getUsedPropDefinitions = animId => {
    return this.getTweens(animId).map(t => t.definition);
  }

  getUnusedPropDefinitions = (animId) => {
    return difference(
      getPropDefinitionList(),
      this.getUsedPropDefinitions(animId)
    );
  }

  render() {
    const { animations } = this.state;
    return (
      <Context.Provider
        value={{
          animations,

          importAnimations: this.importAnimations,

          addAnimation: this.addAnimation,
          removeAnimation: this.removeAnimation,
          setAnimationOffset: this.setAnimationOffset,

          addTween: this.addTween,
          removeTween: this.removeTween,

          addKeyframe: this.addKeyframe,

          setKeyframeTime: this.setKeyframeTime,
          setKeyframeValue: this.setKeyframeValue,

          setTweenPosition: this.setTweenPosition,

          getTweens: this.getTweens,
          getKeyframes: this.getKeyframes,

          getUsedPropDefinitions: this.getUsedPropDefinitions,
          getUnusedPropDefinitions: this.getUnusedPropDefinitions
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}