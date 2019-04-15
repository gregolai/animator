import rework from 'rework';
import { getPropDefinitionFromCSSName } from './cssProps';

export default cssString => {

  const ast = rework(cssString, {
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseValue: true,
    parseCustomProperty: true,
  });

  const animations = [];

  ast.use((node, fn) => {
    node.rules.forEach(rule => {

      if (rule.keyframes) {
        const anim = {
          id: rule.name,
          tweens: []
        }
        animations.push(anim);
        
        // each percent declaration
        rule.keyframes.forEach(keyframe => {

          // get ratios from percent strings
          const ratios = keyframe
            .values
            .map(v => {
              if(v === 'from') return 0;
              if(v === 'to') return 1;
              return parseFloat(v) / 100;
            });
          
          // each "prop: value" pair
          keyframe.declarations.forEach(decl => {

            const cssName = decl.property;
            const definition = getPropDefinitionFromCSSName(cssName);
            if (!definition) {
              console.warn(`Definition for CSS prop not yet supported: ${cssName}`);
              return; // EARLY EXIT
            }
            
            const value = definition.parse(decl.value);

            let tween = anim.tweens.find(t => t.definition.name === definition.name);
            if (!tween) {
              tween = {
                definition,
                easing: 'linear',
                handles: []
              };
              anim.tweens.push(tween);
            }

            ratios.forEach(time => {
              let handle = tween.handles.find(h => h.time === time);
              if (!handle) {
                handle = {
                  time,
                  value
                };
                tween.handles.push(handle);
              }
            });
          })
        });

        // sort handles by time
        anim.tweens.forEach(tween => {
          tween.handles.sort((a, b) => a.time - b.time);
        })
      }
    });
  });

  return animations;
}