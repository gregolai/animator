import React from 'react';
import rework from 'rework';
import last from 'lodash/last';
import clamp from 'lodash/clamp';
import difference from 'lodash/difference';
import {
  getPropDefinitionFromCSSName,
  getPropDefinitionFromName,
  getPropDefinitionList
} from './utils/cssProps';

import update from 'immutability-helper';
import uid from 'uid';

const createAnimation = ({ name = undefined, offset = { x: 0, y: 0 } }) => {
  const id = uid(8);
  return {
    id,
    name: name || `Animation ${id}`,
    offset
  }
}

const createTween = ({ animId, definition, easing = 'linear' }) => {
  const id = uid(8);
  return {
    animId,
    id,
    definition,
    easing,
    keyframes: []
  }
}

const createKeyframe = ({ time, value }) => {
  return {
    id: uid(8),
    time,
    value
  };
}

const fromCSSString = cssString => {
  const animations = [];
  const tweens = [];
  
  rework(cssString, {
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseValue: true,
    parseCustomProperty: true,
  }).use((node, fn) => {
    node.rules.forEach(rule => {

      if (rule.keyframes) {

        const anim = createAnimation({ name: rule.name });

        animations.push(anim);

        // each percent declaration
        rule.keyframes.forEach(keyframe => {

          // get ratios from percent strings
          const times = keyframe
            .values
            .map(v => {
              if(v === 'from') return 0;
              if(v === 'to') return 1;
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

            let tween = tweens.find(t => t.definition === definition);
            if (!tween) {
              tween = createTween({
                animId: anim.id,
                definition
              });
              tweens.push(tween);
            }

            times.forEach(time => {
              let keyframe = tween.keyframes.find(h => h.time === time);
              if (!keyframe) {
                keyframe = {
                  time,
                  value
                };
                tween.keyframes.push(keyframe);
              }
            });
          })
        });

        // sort keyframes by time
        tweens.forEach(tween => {
          tween.keyframes.sort((a, b) => a.time - b.time);
        })
      }
    });
  });
  
  return { animations, tweens };
}

const Context = React.createContext();
export default class AnimationStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    animations: [],
    tweens: []
  }

  _getAnimation = animId => {
    const { animations } = this.state;
    const animIndex = animations.findIndex(a => a.id === animId);
    return {
      anim: animations[animIndex] || null,
      animIndex
    };
  };

  _getTween = tweenId => {
    const { tweens } = this.state;
    const tweenIndex = tweens.findIndex(t => t.id === tweenId);
    return {
      tween: tweens[tweenIndex] || null,
      tweenIndex
    };
  }

  _getKeyframe = (tweenId, keyframeIndex) => {
    const { tween, tweenIndex } = this._getTween(tweenId);
    return {
      tween,
      tweenIndex,
      keyframe: tween ? (tween.keyframes[keyframeIndex] || null) : null
    }
  }
  
  _getKeyframeAtTime = (tweenId, time) => {
    const { tween, tweenIndex } = this._getTween(tweenId);
    const keyframes = tween ? tween.keyframes : [];
    const keyframeIndex = keyframes.findIndex(h => h.time === time);
    return {
      tween,
      tweenIndex,
      keyframeIndex,
      keyframe: keyframes[keyframeIndex] || null
    };
  }

  importAnimations = (cssString, replace = false) => {
    let { animations, tweens } = fromCSSString(cssString);
    if (!replace) {
      animations = [...this.state.animations, ...animations];
      tweens = [...this.state.tweens, ...tweens];
    }
    this.setState({ animations, tweens });
  }

  addAnimation = () => {
    const anim = createAnimation({
      offset: { x: 0, y: 0 }
    });
    this.setState({
      animations: [...this.state.animations, anim]
    });
    return anim;
  }

  removeAnimation = (animId) => {
    const { anim, animIndex } = this._getAnimation(animId);
    if (!anim) return;

    const { animations, tweens } = this.state;
    this.setState({
      animations: update(animations, { $splice: [[animIndex, 1]] }),
      tweens: tweens.filter(t => t.animId !== animId)
    });
    return { anim, animIndex };
  }

  setAnimationOffset = (animId, offset = { x: 0, y: 0 }) => {
    const { anim, animIndex } = this._getAnimation(animId);
    if (!anim) return;
    
    const { animations } = this.state;
    this.setState({
      animations: update(animations, {
        [animIndex]: {
          offset: { $set: offset }
        }
      })
    })
  }

  addTween = (animId, propName) => {
    const { anim } = this._getAnimation(animId);
    if (!anim) return;

    const definition = getPropDefinitionFromName(propName);
    if (!definition) return;

    const { tweens } = this.state;

    // prevent duplicates
    if (tweens.find(t => t.definition === definition)) return;

    this.setState({
      tweens: [
        ...tweens,
        createTween({ animId, definition })
      ]
    })
  }

  removeTween = (tweenId) => {
    const { tween, tweenIndex } = this._getTween(tweenId);
    if (!tween) return;

    const { tweens } = this.state;
    this.setState({
      tweens: update(tweens, { $splice: [[tweenIndex, 1]] })
    })
  }

  addKeyframe = (tweenId, time, value, updateIfExists = true) => {
    const { tween, tweenIndex } = this._getTween(tweenId);
    if (!tween) return;

    // Check existing
    {
      const { keyframe, keyframeIndex } = this._getKeyframeAtTime(tweenId, time);
      if (keyframe) {
        if (updateIfExists) {
          this.setKeyframeValue(tweenId, keyframeIndex, value);
        }
        return;
      }
    }

    // Insert at correct time
    const spliceIndex = tween.keyframes.filter(h => h.time < time).length;

    const { tweens } = this.state;
    this.setState({
      tweens: update(tweens, {
        [tweenIndex]: {
          keyframes: { $splice: [[createKeyframe({ time, value }), 0, spliceIndex]] }
        }
      })
    })
  }

  setKeyframeTime = (tweenId, keyframeIndex, time) => {
    const { keyframe, tweenIndex } = this._getKeyframe(tweenId, keyframeIndex);
    if (!keyframe) return;

    this.setState({
      tweens: update(this.state.tweens, {
        [tweenIndex]: {
          keyframes: {
            [keyframeIndex]: { $merge: { time } }
          }
        }
      })
    })
  }

  setKeyframeValue = (tweenId, keyframeIndex, value) => {
    const { keyframe, tweenIndex } = this._getKeyframe(tweenId, keyframeIndex);
    if (!keyframe) return;

    this.setState({
      tweens: update(this.state.tweens, {
        [tweenIndex]: {
          keyframes: {
            [keyframeIndex]: { $merge: { value } }
          }
        }
      })
    });
  }

  setTweenPosition = (tweenId, time) => {
    const { tween, tweenIndex } = this._getTween(tweenId);
    if (!tween) return;
    
    const { keyframes } = tween;

    const time0 = keyframes[0].time;

    const diff = last(keyframes).time - keyframes[0].time;

    const clampedTime = clamp(time, 0, 1 - diff);

    this.setState({
      tweens: update(this.state.tweens, {
        [tweenIndex]: {
          keyframes: {
            $set: keyframes.map(keyframe => ({
              ...keyframe,
              time: clampedTime + (keyframe.time - time0)
            }))
          }
        }
      })
    });
  }

  getTweens = (animId) => {
    return this.state.tweens.filter(t => t.animId === animId);
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

          getUsedPropDefinitions: this.getUsedPropDefinitions,
          getUnusedPropDefinitions: this.getUnusedPropDefinitions
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}