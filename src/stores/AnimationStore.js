import { React, normalizeRatio } from 'utils';
import rework from 'rework';
import difference from 'lodash/difference';
import { uniqueNamesGenerator } from 'unique-names-generator';
import randomColor from 'randomcolor';

import { getDefinition, getAnimatedDefinitions } from 'utils/definitions';

import db from 'utils/db';
import interpolate from 'utils/interpolate';
import { createPersist } from 'utils/persist';

const persist = createPersist('AnimationStore', {
  animations: [],
  instances: [],
  keyframes: [],
  tweens: []
});

const createAnimation = ({ name = undefined }) => {
  return {
    color: randomColor(),
    name: name || uniqueNamesGenerator('-', true)
  }
}

const createInstance = ({
  animId,
  definitionValues = {},
  name = uniqueNamesGenerator('-', true)
}) => {
  return {
    animId,
    color: randomColor(),
    definitionValues,
    name
  }
}

const createTween = ({ animId, definitionId, easing = 'linear', lerp, name }) => {
  return {
    animId,
    definitionId,
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
  const instances = [];
  const keyframes = [];
  const tweens = [];

  rework(cssString, {
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseValue: true,
    parseCustomProperty: true,
  }).use((node, fn) => {


    node.rules.forEach(rule => {

      // @keyframes
      if (rule.type === 'keyframes') {

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

            const definition = getDefinition(decl.property);
            if (!definition) {
              console.warn(`Definition for CSS prop not yet supported: ${decl.property}`);
              return; // EARLY EXIT
            }

            const definitionId = definition.id;

            // e.g. 100px => 100
            const value = definition.parse(decl.value);

            // get tween with definition
            let tween = db.getOne(tweens, t => t.definitionId === definitionId).item;
            if (!tween) {
              // create tween with definition
              tween = db.createOne(tweens, createTween({
                animId: anim.id,
                definitionId
              }), true).item;
            }

            times.forEach(time => {

              const keyframe = db.getOne(keyframes, kf => kf.tweenId === tween.id && kf.time === time).item
              if (!keyframe) {
                db.createOne(keyframes, createKeyframe({
                  animId: anim.id,
                  tweenId: tween.id,
                  time,
                  value
                }), true);
              }
            });
          })
        });
      }

      if (rule.type === 'rule') {

        rule.selectors.forEach(selector => {

          let animation;
          const instanceName = selector;
          const definitionValues = {};

          rule.declarations.forEach(decl => {

            if (decl.property === 'animation') {

              // PARSE ANIMATION
              const parts = decl.value.split(' ');
              const animName = parts[0];
              // const duration = parts[1]; // TODO
              // const repeat = parts[2]; // TODO

              // FIND ANIMATION BY NAME
              animation = animations.find(anim => anim.name === animName);
            } else {
              const definition = getDefinition(decl.property);
              if (!definition) {
                console.warn(`Definition for CSS prop not yet supported: ${decl.property}`);
                return; // EARLY EXIT
              }
              definitionValues[definition.id] = definition.parse(decl.value);
            }

          });

          if (animation) {
            // INSERT INSTANCE
            db.createOne(instances, createInstance({
              animId: animation.id,
              definitionValues,
              name: instanceName
            }), true);
          }
        });
      }

    });
  });

  return { animations, instances, keyframes, tweens };
}


const Context = React.createContext();
export default class AnimationStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    animations: persist.animations.read(),
    instances: persist.instances.read(),
    keyframes: persist.keyframes.read(),
    tweens: persist.tweens.read(),
  };

  importAnimations = (cssString, replace = false) => {
    let { animations, instances, keyframes, tweens } = fromCSSString(cssString);

    if (!replace) {
      animations = [...this.state.animations, ...animations];
      instances = [...this.state.instances, ...instances];
      keyframes = [...this.state.keyframes, ...keyframes];
      tweens = [...this.state.tweens, ...tweens];
    }

    this.setState({ animations, instances, keyframes, tweens });
  }

  // CREATE - Animation
  createAnimation = () => {
    const { list: animations, item: animation } = db.createOne(this.state.animations, createAnimation({}));

    this.setState({ animations });
    persist.animations.write(animations);

    return animation;
  }

  setAnimationName = (animId, name) => {
    const { list: animations, item: animation } = db.setOne(this.state.animations, animId, { name })

    this.setState({ animations });
    persist.animations.write(animations);

    return animation;
  };

  // DELETE - Animation
  deleteAnimation = (animId) => {
    const { list: animations, item: animation } = db.deleteOne(this.state.animations, animId);
    const { list: instances } = db.deleteMany(this.state.instances, instance => instance.animId === animId);
    const { list: tweens } = db.deleteMany(this.state.tweens, tween => tween.animId === animId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.animId === animId);

    this.setState({
      animations,
      instances,
      tweens,
      keyframes
    });
    persist.animations.write(animations);
    persist.instances.write(instances);
    persist.tweens.write(tweens);
    persist.keyframes.write(keyframes);

    return animation;
  }

  createInstance = ({ animId }) => {
    const { list: instances, item: instance } = db.createOne(this.state.instances,
      createInstance({ animId })
    );

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  }

  setInstanceAnimation = (instanceId, animId) => {
    const { list: instances, item: instance } = db.setOne(this.state.instances, instanceId, { animId });

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  };

  setInstanceName = (instanceId, name) => {
    const { list: instances, item: instance } = db.setOne(this.state.instances, instanceId, { name })

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  }

  getInstanceDefinitionValue = (instanceId, definitionId) => {
    const instance = this.getInstance(instanceId);
    const definition = getDefinition(definitionId);

    if (!instance || !definition) {
      return undefined;
    }

    let value = instance.definitionValues[definitionId];
    if (value === undefined) {
      value = definition.defaultValue;
    }
    return value;
  };

  setInstanceDefinitionValue = (instanceId, definitionId, value) => {
    const instance = this.getInstance(instanceId);
    const definition = getDefinition(definitionId);

    if (!instance || !definition) {
      return;
    }

    const definitionValues = {
      ...instance.definitionValues,
      [definitionId]: value
    };
    // special case when undefined - delete key
    if (value === undefined) {
      delete definitionValues[definitionId];
    }

    const { list: instances } = db.setOne(this.state.instances, instanceId, {
      ...instance,
      definitionValues
    });

    this.setState({ instances });
    persist.instances.write(instances);
  };

  deleteInstance = (instanceId) => {
    const { list: instances, item: instance } = db.deleteOne(this.state.instances, instanceId);

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  }

  // CREATE - Tween
  createTween = (animId, definitionId) => {

    const definition = getDefinition(definitionId);

    // ensure definition and prevent duplicates
    if (
      !definition ||
      db.getOne(this.state.tweens, t => t.animId === animId && t.definitionId === definitionId).item
    ) {
      return null;
    }

    const { list: tweens, item: tween } = db.createOne(this.state.tweens, createTween({
      animId,
      definitionId
    }))

    this.setState({ tweens });
    persist.tweens.write(tweens);

    return tween;
  }

  // DELETE - Tween
  deleteTween = (tweenId) => {
    const { list: tweens, item: tween } = db.deleteOne(this.state.tweens, tweenId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.tweenId === tweenId);

    this.setState({ keyframes, tweens });
    persist.keyframes.write(keyframes);
    persist.tweens.write(tweens);

    return tween;
  }

  createKeyframe = (tweenId, time, value) => {
    time = normalizeRatio(time);

    const tween = this.getTween(tweenId);

    // ensure tween and prevent duplicate keyframe time
    if (
      !tween ||
      this.getKeyframeAtTime(tweenId, time)
    ) {
      return null;
    }

    const { list: keyframes, item: keyframe } = db.createOne(this.state.keyframes, createKeyframe({
      animId: tween.animId,
      tweenId,
      time,
      value
    }))

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);
    return keyframe;
  }

  setKeyframeTime = (keyframeId, time) => {
    time = normalizeRatio(time);

    const keyframe = this.getKeyframe(keyframeId);

    // ensure tween and prevent duplicate keyframe time
    if (
      !keyframe ||
      this.getKeyframeAtTime(keyframe.tweenId, time)
    ) {
      return null;
    }

    const { list: keyframes } = db.setOne(this.state.keyframes, keyframeId, { time });

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  }

  setKeyframeValue = (keyframeId, value) => {
    const { list: keyframes, item: keyframe } = db.setOne(this.state.keyframes, keyframeId, { value });

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  }

  setKeyframeValueAtTime = (tweenId, time, value) => {
    const keyframe = this.getKeyframeAtTime(tweenId, time);
    return keyframe ?
      this.setKeyframeValue(keyframe.id, value) :
      this.createKeyframe(tweenId, time, value);
  }

  deleteKeyframe = (keyframeId) => {
    const { list: keyframes, item: keyframe } = db.deleteOne(this.state.keyframes, keyframeId);

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  }

  interpolate = (tweenId, time) => {
    const tween = this.getTween(tweenId);
    if (!tween) return undefined;

    const definition = getDefinition(tween.definitionId)

    return interpolate(
      this.getKeyframes(tweenId),
      time,
      definition.lerp,
      tween.easing
    );
  }

  interpolateInstance = (instanceId, tweenId, playheadTime) => {
    const instance = this.getInstance(instanceId);
    const tween = this.getTween(tweenId);
    const definition = getDefinition(tween.definitionId)
    if (!instance || !tween || !definition) return undefined;

    const delay = this.getInstanceDefinitionValue(instanceId, 'animation-delay');
    const duration = this.getInstanceDefinitionValue(instanceId, 'animation-duration');
    const easing = this.getInstanceDefinitionValue(instanceId, 'animation-timing-function');

    const scaledTime = (playheadTime - delay) / duration;

    return interpolate(
      this.getKeyframes(tweenId),
      scaledTime,
      definition.lerp,
      easing
    );
  }

  getUnusedPropDefinitions = (animId) => {
    if (animId === -1) {
      return [];
    }

    return difference(
      getAnimatedDefinitions(),
      this.getTweens(animId).map(t => getDefinition(t.definitionId))
    );
  }

  getAnimation = animId => {
    return db.getOne(this.state.animations, animId).item;
  }

  getAnimations = () => {
    return [...this.state.animations];
  }

  getInstance = instanceId => {
    return db.getOne(this.state.instances, instanceId).item;
  }

  getInstances = (ids) => {
    if (ids === undefined) return [...this.state.instances];

    return db.getMany(this.state.instances, ids).items;
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
    time = normalizeRatio(time);

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
          setAnimationName: this.setAnimationName, // UPDATE
          deleteAnimation: this.deleteAnimation, // DELETE

          createTween: this.createTween, // CREATE
          deleteTween: this.deleteTween, // DELETE

          createKeyframe: this.createKeyframe, // CREATE
          // TODO: DELETE
          deleteKeyframe: this.deleteKeyframe,

          setKeyframeTime: this.setKeyframeTime,
          setKeyframeValue: this.setKeyframeValue,
          setKeyframeValueAtTime: this.setKeyframeValueAtTime,

          getAnimation: this.getAnimation,
          getAnimations: this.getAnimations,

          createInstance: this.createInstance,
          setInstanceAnimation: this.setInstanceAnimation,
          setInstanceName: this.setInstanceName,
          setInstanceDefinitionValue: this.setInstanceDefinitionValue,
          getInstances: this.getInstances,
          getInstance: this.getInstance,
          getInstanceDefinitionValue: this.getInstanceDefinitionValue,
          deleteInstance: this.deleteInstance,

          getTween: this.getTween,
          getTweens: this.getTweens,

          getKeyframe: this.getKeyframe, // READ
          getKeyframeAtTime: this.getKeyframeAtTime,
          getKeyframes: this.getKeyframes,

          getUnusedPropDefinitions: this.getUnusedPropDefinitions,

          interpolate: this.interpolate,
          interpolateInstance: this.interpolateInstance
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}