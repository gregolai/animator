import React from 'react';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import { getStyleProp } from './styleProps';

// a tiny 6-character hexidecimal uid shim
const uid = (length = 6) =>
    `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)}`.slice(
        0,
        length
    );

const parsePercent = key => {
    if (key === 'from') {
        return 0;
    }
    if (key === 'to') {
        return 100;
    }
    return parseInt(key, 10);
};

const writeKeyframe = ([key, cssProps]) => {
    key = `${parsePercent(key)}%`;

    let css = `${key} { `;

    Object.entries(cssProps).forEach(([propId, propValue]) => {
        const styleProp = getStyleProp(propId);
        if (!styleProp) {
            return;
        }

        // parse, then format, to normalize the result
        const formattedValue = styleProp.format(styleProp.parse(propValue));

        css += `${styleProp.cssName}: ${formattedValue};`;
    });

    return css + '}';
};

/**
 * Remaps keyframes from this format:
 *   {
 *     [percentValue]%: {
 *       [propId]: [propValue]
 *     }
 *   }
 * to this format:
 *   {
 *     [propId]: [
 *       { time: [percentValue/100], value: [propValue] }
 *     ]
 *   }
 *
 * This is an expensive operation, but is necessary to remap the AnimationStore
 * API into AnimationController API, which is consumed by the Squarespace Animator.
 * We need to interpolate every existing CSS prop along its own keyframes.
 *
 * @param {Object} keyframes
 */
const remapKeyframes = keyframesIn => {
    const keyframesOut = {};

    Object.entries(keyframesIn).forEach(([percentValue, styleObj]) => {
        const time = Number(percentValue / 100).toFixed(2);

        Object.entries(styleObj).forEach(([propId, propValue]) => {
            const styleProp = getStyleProp(propId);
            if (!styleProp) {
                return;
            }

            let keyframes = keyframesOut[propId];

            // create keyframes array if it doesnt exist
            if (!keyframes) {
                keyframes = keyframesOut[propId] = [];
            }

            // Prevent duplicate times
            if (keyframes.find(kf => kf.time === time)) {
                return;
            }

            keyframes.push({
                time: time,
                value: styleProp.parse(propValue)
            });
        });
    });

    return keyframesOut;
};

const Context = React.createContext({
    nameToKeyframes: {},
    nameToStyleIds: {}
});

export default class AnimationStore extends React.Component {
    static propTypes = {
        /**
         * Animation names mapping to percent-values, similar to native CSS animation keyframes.
         * The style prop keys are camel-cased, as if being passed as inline props:
         * For example:
         * {
         *   anim1: {
         *     0: { width: 100 },
         *     100: { width: 500 },
         *   },
         *   anim2: {
         *     0: { width: 100, backgroundColor: 'yellow' },
         *     50: { width: 500, backgroundColor: 'blue' },
         *     100: { width: 100, backgroundColor: 'green' }
         *   }
         */
        animations: (props, propName, componentName) => {
            const err = message => {
                return new Error(
                    `Props ${propName} in ${componentName}: ${message}`
                );
            };

            // CHECK: animations is object
            if (!isObject(props[propName])) {
                return err('Must be an object');
            }

            const animEntries = Object.entries(props[propName]);
            for (let a = 0; a < animEntries.length; ++a) {
                const [animName, animValue] = animEntries[a];

                // CHECK: anim value is object
                if (!isObject(animValue)) {
                    return err(`${animName} must be an object`);
                }

                const percentEntries = Object.entries(animValue);
                for (let p = 0; p < percentEntries.length; ++p) {
                    const [percentName, percentValue] = percentEntries[p];

                    // CHECK: percent key can be parsed
                    if (isNaN(parsePercent(percentName))) {
                        return err(
                            `${animName} has an invalid key: ${percentName}`
                        );
                    }

                    // CHECK: percent styles is object
                    if (!isObject(percentValue)) {
                        return err(
                            `${animName} at "${percentName}" must be an object`
                        );
                    }

                    const styleEntries = Object.entries(percentValue);
                    for (let s = 0; s < styleEntries.length; ++s) {
                        const [styleName, styleValue] = styleEntries[s];

                        // CHECK: style prop supported
                        if (!getStyleProp(styleName)) {
                            return err(
                                `${animName} at "${percentName}" has an unsupported style prop: ${styleName}`
                            );
                        }
                    }
                }
            }
        }
    };

    static Context = Context;

    /**
     * Maps animation names to keyframes, like so:
     * {
     *   [animationName]: {
     *     [styleName]: <keyframes>
     *   }
     * }
     */
    nameToKeyframes = {};

    /**
     * Maps animation names to unique CSS animation names, like so:
     * {
     *   [animationName]: <css_keyframes_name>
     * }
     */
    nameToStyleIds = {};

    constructor(props) {
        super(props);

        let css = '';

        // generate a UID to prevent global CSS naming conflicts
        const slug = uid();

        Object.entries(props.animations).forEach(([name, keyframes]) => {
            // A unique name is necessary to prevent global CSS naming conflicts
            const keyframesId = `${name}-${slug}`;

            this.nameToKeyframes[name] = remapKeyframes(keyframes);
            this.nameToStyleIds[name] = keyframesId;

            css += `@keyframes ${keyframesId} { ${Object.entries(keyframes)
                .map(writeKeyframe)
                .join(' ')} } `;
        });

        this.style = document.createElement('style');
        this.style.innerText = css;
        document.body.appendChild(this.style);
    }

    componentWillUnmount() {
        document.body.removeChild(this.style);
    }

    render() {
        return (
            <Context.Provider
                value={{
                    nameToKeyframes: this.nameToKeyframes,
                    nameToStyleIds: this.nameToStyleIds
                }}
            >
                {this.props.children}
            </Context.Provider>
        );
    }
}
