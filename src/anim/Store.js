import React from 'react';
import clamp from 'lodash/clamp';
import last from 'lodash/last';
import cssbeautify from 'cssbeautify';
import importAnimations from './utils/importAnimations';

import {
  getPropDefinitionFromName,
  getPropDefinitionList
} from './utils/cssProps';

import { imap, iarray } from './utils/immutable';

const Context = React.createContext();
export default class Store extends React.Component {
  state = {
    animations: [],
    selectedAnimId: -1
  }

  nextAnimationId = 1000;

  static Consumer = Context.Consumer;

  _findAnimation = animId => {
    const index = this.state.animations.findIndex(a => a.id === animId);
    return [this.state.animations[index] || null, index];
  };

  _findTween = (anim, definitionName) => {
    const index = anim.tweens.findIndex(t => t.definition.name === definitionName);
    return [anim.tweens[index] || null, index];
  };

  addAnimation = () => {
    const id = this.nextAnimationId++;

    let { animations, selectedAnimId } = this.state;

    if (selectedAnimId === -1) {
      selectedAnimId = id;
    }

    this.setState({
      selectedAnimId,
      animations: iarray.push(animations, {
        id,
        tweens: []
      })
    });
  }

  removeAnimation = animId => {
    const [anim, index] = this._findAnimation(animId);
    if (anim) {
      let { animations, selectedAnimId } = this.state;

      // if removing selected, apply new selected
      if (animId === selectedAnimId) {
        const nextAnim = animations[index+1] || animations[index-1];
        selectedAnimId = nextAnim ? nextAnim.id : -1;
      }

      this.setState({
        animations: iarray.remove(animations, index),
        selectedAnimId
      })
    }
  }

  setSelectedAnimation = animId => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      this.setState({ selectedAnimId: anim.id })
    }
  }

  getUsedPropDefinitions = animId => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      return anim.tweens.map(tween => tween.definition);
    }
    return [];
  }

  getUnusedPropDefinitions = animId => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      return getPropDefinitionList().filter(
        def => !anim.tweens.find(tween => tween.definition.name === def.name)
      );
    }
    return [];
  }

  addTween = (animId, definitionName) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, _] = this._findTween(anim, definitionName);
      if (!tween) {
        const definition = getPropDefinitionFromName(definitionName);
        if (definition) {
          const tween = {
            animId,
            definition,
            easing: 'linear',
            handles: []
          };
          anim.tweens.push(tween);
          this.forceUpdate();
        }
      }
    }
    
  }

  removeTween = (animId, definitionName) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, index] = this._findTween(anim, definitionName);
      if (tween) {
        anim.tweens.splice(index, 1);
        this.forceUpdate();
      }
    }
  }

  setTweenHandle = (animId, definitionName, handleIndex, value) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, _] = this._findTween(anim, definitionName);
      if (tween) {
        const handle = tween.handles[handleIndex];
        handle.time = value;

        // TODO: clamp between prev and next handle

        this.forceUpdate();
      }
    }
  }

  setTweenPosition = (animId, definitionName, value) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, _] = this._findTween(anim, definitionName);
      if (tween) {
        const firstHandle = tween.handles[0];
        if (firstHandle) {
          console.log('value in:', value);

          const time0 = firstHandle.time;

          const diff = last(tween.handles).time - firstHandle.time;
          value = clamp(value, 0, 1 - diff);

          tween.handles.forEach(handle => {
            handle.time = value + (handle.time - time0);
          });

          this.forceUpdate();
        }
      }
    }
  }

  getCss = () => {
    const css = this.state.animations.map(anim => {
      if (anim.tweens.length === 0) return '';
  
      const percentGroups = {};
  
      const pushTimestamp = (name, time, value) => {
        const percent = Math.floor(time * 100);
        (percentGroups[percent] = percentGroups[percent] || []).push({ name, value });
      }
  
      anim.tweens.forEach(tween => {
        tween.handles.forEach(h => pushTimestamp(tween.cssName, h.time, h.value));
      });
  
      const sorted = Object.entries(percentGroups)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  
      const writeProp = ({ name, value }) => `${name}: ${value};`;
  
      const writePercentGroup = (percent, group) => `${percent}% { ${group.map(writeProp).join(' ') } }`;
  
      return `@keyframes anim_${anim.id} { ${sorted.map(([percent, group]) => writePercentGroup(percent, group)).join(' ') } }`;
    }).join(' ');
  
    return cssbeautify(css, {
      indent: '  ',
      autosemicolon: true
    });
  }

  importCss = cssString => {
    const animations = importAnimations(cssString);
    this.setState({
      animations,
      selectedAnimId: -1
    });
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,

          addAnimation: this.addAnimation,
          removeAnimation: this.removeAnimation,
          setSelectedAnimation: this.setSelectedAnimation,
          getUsedPropDefinitions: this.getUsedPropDefinitions,
          getUnusedPropDefinitions: this.getUnusedPropDefinitions,
          addTween: this.addTween,
          removeTween: this.removeTween,
          setTweenHandle: this.setTweenHandle,
          setTweenPosition: this.setTweenPosition,

          getCss: this.getCss,
          importCss: this.importCss
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}
