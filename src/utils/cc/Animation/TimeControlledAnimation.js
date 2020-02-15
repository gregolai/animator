import React, { useContext } from 'react';
import AnimationStore from '../AnimationStore';
import AnimationController from '../AnimationController';

export default ({
    children,

    /**
     * Animation delay, in milliseconds
     */
    delay = 0,

    /**
     * Animation duration, in milliseconds
     */
    duration = 1000,

    /**
     * Animation timing function
     * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
     *
     * Also, accepts a 4-element array, which are cubic-bezier control points for
     * [X1, Y1, X2, Y2]
     */
    easing,

    /**
     * Tag name
     */
    is: Component = 'div',

    /**
     * An animation name (key) passed into the closest ancestor AnimationStore. The
     * name is provided there and consumed here through a React context Provider/Consumer.
     */
    name,

    /**
     * The playhead time, in milliseconds
     */
    time = 0,

    ...rest
}) => {
    const { nameToKeyframes } = useContext(AnimationStore.Context);

    const keyframes = nameToKeyframes[name];
    if (!keyframes) {
        // name not found
        console.warn(`Animation with name could not be found: ${name}`);
        return null;
    }

    return (
        <AnimationController
            delay={delay}
            duration={duration}
            easing={easing}
            format={true}
            keyframes={keyframes}
            time={time}
        >
            {formattedStyles => (
                <Component
                    {...rest}
                    style={{
                        ...rest.style, // base style
                        ...formattedStyles
                    }}
                >
                    {children}
                </Component>
            )}
        </AnimationController>
    );
};
