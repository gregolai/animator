import { React, normalizeRatio, createUniqueName, getRandomColor, isNumber } from 'common';
import rework from 'rework';
import difference from 'lodash/difference';

import { getDefinition, getAnimatedDefinitions } from 'utils/definitions';
import { exportJSF } from 'utils/importexport';

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
    color: getRandomColor(),
    name: name || createUniqueName()
  };
};

const createInstance = ({
  animationId,
  definitionValues = {
    'animation-delay': getDefinition('animation-delay').parse(0),
    'animation-duration': getDefinition('animation-duration').parse(1000),
    'animation-timing-function': getDefinition('animation-timing-function').parse('linear'),
    position: getDefinition('position').parse('absolute'),
    width: getDefinition('width').parse(30),
    height: getDefinition('height').parse(30),
    'background-color': getDefinition('background-color').parse('blue')
  },
  name = createUniqueName()
}) => {
  return {
    animationId,
    color: getRandomColor(),
    definitionValues,
    name
  };
};

const createTween = ({ animationId, definitionId }) => {
  return {
    animationId,
    definitionId
  };
};

const createKeyframe = ({ animationId, tweenId, time, value }) => {
  return {
    animationId,
    tweenId,
    time,
    value
  };
};

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
    parseCustomProperty: true
  }).use((node, fn) => {
    node.rules.forEach(rule => {
      // @keyframes
      if (rule.type === 'keyframes') {
        const anim = db.createOne(animations, createAnimation({ name: rule.name }), true).item;

        // each percent declaration
        rule.keyframes.forEach(keyframe => {
          // get ratios from percent strings
          const times = keyframe.values.map(v => {
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
              tween = db.createOne(
                tweens,
                createTween({
                  animationId: anim.id,
                  definitionId
                }),
                true
              ).item;
            }

            times.forEach(time => {
              const keyframe = db.getOne(
                keyframes,
                kf => kf.tweenId === tween.id && kf.time === time
              ).item;
              if (!keyframe) {
                db.createOne(
                  keyframes,
                  createKeyframe({
                    animationId: anim.id,
                    tweenId: tween.id,
                    time,
                    value
                  }),
                  true
                );
              }
            });
          });
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
            db.createOne(
              instances,
              createInstance({
                animationId: animation.id,
                definitionValues,
                name: instanceName
              }),
              true
            );
          }
        });
      }
    });
  });

  return { animations, instances, keyframes, tweens };
};

const Context = React.createContext();
export default class AnimationStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    animations: persist.animations.read(),
    instances: persist.instances.read(),
    keyframes: persist.keyframes.read(),
    tweens: persist.tweens.read()
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
  };

  // CREATE - Animation
  createAnimation = () => {
    const { list: animations, item: animation } = db.createOne(
      this.state.animations,
      createAnimation({})
    );

    this.setState({ animations });
    persist.animations.write(animations);

    return animation;
  };

  setAnimationName = (animationId, name) => {
    const { list: animations, item: animation } = db.setOne(this.state.animations, animationId, {
      name
    });

    this.setState({ animations });
    persist.animations.write(animations);

    return animation;
  };

  // DELETE - Animation
  deleteAnimation = animationId => {
    const { list: animations, item: animation } = db.deleteOne(this.state.animations, animationId);
    const { list: instances } = db.deleteMany(
      this.state.instances,
      instance => instance.animationId === animationId
    );
    const { list: tweens } = db.deleteMany(this.state.tweens, tween => tween.animationId === animationId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.animationId === animationId);

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
  };

  createInstance = ({ animationId }) => {
    const { list: instances, item: instance } = db.createOne(
      this.state.instances,
      createInstance({ animationId })
    );

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  };

  setInstanceAnimation = (instanceId, animationId) => {
    const { list: instances, item: instance } = db.setOne(this.state.instances, instanceId, {
      animationId
    });

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  };

  setInstanceName = (instanceId, name) => {
    const { list: instances, item: instance } = db.setOne(this.state.instances, instanceId, {
      name
    });

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  };

  getInstanceDefinitionValue = (instanceId, definitionId) => {
    const instance = this.getInstance(instanceId);
    const definition = getDefinition(definitionId);

    if (!instance || !definition) {
      return undefined;
    }

    let value = instance.definitionValues[definitionId];
    // if (value === undefined) {
    //   value = definition.defaultValue;
    // }
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

  deleteInstance = instanceId => {
    const { list: instances, item: instance } = db.deleteOne(this.state.instances, instanceId);

    this.setState({ instances });
    persist.instances.write(instances);

    return instance;
  };

  // CREATE - Tween
  createTween = (animationId, definitionId) => {
    const definition = getDefinition(definitionId);

    // ensure definition and prevent duplicates
    if (
      !definition ||
      db.getOne(this.state.tweens, t => t.animationId === animationId && t.definitionId === definitionId).item
    ) {
      return null;
    }

    const { list: tweens, item: tween } = db.createOne(
      this.state.tweens,
      createTween({
        animationId,
        definitionId
      })
    );

    this.setState({ tweens });
    persist.tweens.write(tweens);

    return tween;
  };

  // DELETE - Tween
  deleteTween = tweenId => {
    const { list: tweens, item: tween } = db.deleteOne(this.state.tweens, tweenId);
    const { list: keyframes } = db.deleteMany(this.state.keyframes, kf => kf.tweenId === tweenId);

    this.setState({ keyframes, tweens });
    persist.keyframes.write(keyframes);
    persist.tweens.write(tweens);

    return tween;
  };

  createKeyframe = (tweenId, time, value) => {
    const tween = this.getTween(tweenId);

    // ensure tween and prevent duplicate keyframe time
    if (!tween || !isNumber(time) || this.getKeyframeAtTime(tweenId, time)) {
      return null;
    }

    // db value cannot be undefined
    if (value === undefined) {
      value = getDefinition(tween.definitionId).defaultValue;
      if (value === undefined) {
        return null;
      }
    }

    time = normalizeRatio(time);

    const { list: keyframes, item: keyframe } = db.createOne(
      this.state.keyframes,
      createKeyframe({
        animationId: tween.animationId,
        tweenId,
        time,
        value
      })
    );

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);
    return keyframe;
  };

  setKeyframeTime = (keyframeId, time) => {

    const keyframe = this.getKeyframe(keyframeId);

    // ensure tween and prevent duplicate keyframe time
    if (!keyframe || !isNumber(time) || this.getKeyframeAtTime(keyframe.tweenId, time)) {
      return null;
    }

    time = normalizeRatio(time);

    const { list: keyframes } = db.setOne(this.state.keyframes, keyframeId, {
      time
    });

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  };

  setKeyframeValue = (keyframeId, value) => {
    const { list: keyframes, item: keyframe } = db.setOne(this.state.keyframes, keyframeId, {
      value
    });

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  };

  setKeyframeValueAtTime = (tweenId, time, value) => {
    const keyframe = this.getKeyframeAtTime(tweenId, time);
    return keyframe
      ? this.setKeyframeValue(keyframe.id, value)
      : this.createKeyframe(tweenId, time, value);
  };

  deleteKeyframe = keyframeId => {
    const { list: keyframes, item: keyframe } = db.deleteOne(this.state.keyframes, keyframeId);

    this.setState({ keyframes });
    persist.keyframes.write(keyframes);

    return keyframe;
  };

  interpolate = (tweenId, time, easing) => {
    const tween = this.getTween(tweenId);
    if (!tween || !isNumber(time)) return undefined;

    const definition = getDefinition(tween.definitionId);

    return interpolate(this.getKeyframes(tweenId), time, definition.lerp, easing);
  };

  getUnusedPropDefinitions = animationId => {
    if (animationId === -1) {
      return [];
    }

    return difference(
      getAnimatedDefinitions(),
      this.getTweens(animationId).map(t => getDefinition(t.definitionId))
    );
  };

  getAnimation = animationId => {
    return db.getOne(this.state.animations, animationId).item;
  };

  getAnimations = () => {
    return [...this.state.animations];
  };

  getInstance = instanceId => {
    return db.getOne(this.state.instances, instanceId).item;
  };

  getInstances = ids => {
    if (ids === undefined) return [...this.state.instances];

    return db.getMany(this.state.instances, ids).items;
  };

  getTween = tweenId => {
    return db.getOne(this.state.tweens, tweenId).item;
  };

  getTweens = animationId => {
    return db.getMany(this.state.tweens, t => t.animationId === animationId).items;
  };

  getKeyframe = keyframeId => {
    return db.getOne(this.state.keyframes, keyframeId).item;
  };

  getKeyframeAtTime = (tweenId, time) => {
    if (!isNumber(time)) return null;

    time = normalizeRatio(time);

    return db.getOne(this.state.keyframes, kf => kf.tweenId === tweenId && kf.time === time).item;
  };

  getKeyframes = tweenId => {
    return db
      .getMany(this.state.keyframes, kf => kf.tweenId === tweenId)
      .items.sort((a, b) => (a.time < b.time ? -1 : 1)); // sort by time
  };

  getExportJSF = () => {
    const { animations, instances, keyframes, tweens } = this.state;
    return exportJSF({ animations, instances, keyframes, tweens });
  }

  getExportCSS = () => {

  }

  render() {
    // TESITNG
    const { animations, instances, keyframes, tweens } = this.state;
    window.stuff = { animations, instances, keyframes, tweens };

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

          getExportCSS: this.getExportCSS,
          getExportJSF: this.getExportJSF
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}
