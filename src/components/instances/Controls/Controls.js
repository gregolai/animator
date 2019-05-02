import { React, cx } from 'common';
import chunk from 'lodash/chunk';
import { AnimationStore, UIStore } from 'stores';
import {
  AddDropdown,
  ColorSquare,
  ExpandingTitle,
  IconButton,
  Popover,
  ValueButton,
  ValueEditor
} from 'components/shared';
import { getDefinition, getDefinitions } from 'utils/definitions';

import BaseProps from './BaseProps';

import styles from './Controls.module.scss';

const ANIMATION_PROPS = ['animation-delay', 'animation-duration', 'animation-timing-function'];

const Controls = ({ className, instance }) => {
  const [expandedDefinitionId, setExpandedDefinition] = React.useState('');
  const [showBaseProps, setShowBaseProps] = React.useState(false);

  return (
    <AnimationStore.Consumer>
      {({
        deleteInstance,
        setInstanceAnimation,
        setInstanceName,
        getAnimation,
        getAnimations,
        getInstanceDefinitionValue,
        setInstanceDefinitionValue
      }) => (
          <UIStore.Consumer>
            {({ selectedInstanceId, setSelectedInstance }) => {
              const isSelected = selectedInstanceId === instance.id;
              return (
                <div className={cx(styles.container, className)}>
                  <div className={styles.head}>
                    <ExpandingTitle
                      accessory={<IconButton icon="close" onClick={() => deleteInstance(instance.id)} />}
                      onEdit={name => setInstanceName(instance.id, name)}
                      className={styles.title}
                      isExpanded={isSelected}
                      label={instance.name}
                      onClick={() => setSelectedInstance(isSelected ? -1 : instance.id)}
                    />
                    <AddDropdown
                      icon="desktop"
                      label="Animation"
                      label2={
                        <div style={{ display: 'flex' }}>
                          <ColorSquare color={getAnimation(instance.animationId).color} />
                          <div style={{ paddingLeft: 11 }}>{getAnimation(instance.animationId).name}</div>
                        </div>
                      }
                      options={getAnimations().map(anim => ({
                        icon: <ColorSquare color={anim.color} />,
                        label: anim.name,
                        value: anim.id
                      }))}
                      onSelect={animationId => {
                        setInstanceAnimation(instance.id, animationId);
                      }}
                      value={instance.animationId}
                    />
                  </div>

                  <div className={styles.body}>
                    <div className={styles.row}>
                      {ANIMATION_PROPS.map(
                        definitionId => {
                          return (
                            <ValueButton
                              key={definitionId}
                              definition={getDefinition(definitionId)}
                              isToggled={expandedDefinitionId === definitionId}
                              onClick={() => {
                                const wasExpanded = expandedDefinitionId === definitionId;
                                setExpandedDefinition(wasExpanded ? '' : definitionId); // toggle
                                if (!wasExpanded) {
                                  setSelectedInstance(instance.id);
                                }
                              }}
                              value={getInstanceDefinitionValue(instance.id, definitionId)}
                            />
                          );
                        }
                      )}

                      <IconButton
                        className={
                          cx(styles.btnShowBaseProps, {
                            [styles.hidden]: !isSelected
                          })
                        }
                        icon="ellipses"
                        isToggled={showBaseProps}
                        onClick={() => setShowBaseProps(!showBaseProps)}
                      />

                      {expandedDefinitionId && (
                        <Popover anchor="down-left" className={styles.editor}>
                          <ValueEditor
                            definitionId={expandedDefinitionId}
                            onChange={value =>
                              setInstanceDefinitionValue(instance.id, expandedDefinitionId, value)
                            }
                            value={getInstanceDefinitionValue(instance.id, expandedDefinitionId)}
                          />
                        </Popover>
                      )}
                    </div>

                    {isSelected && showBaseProps && (
                      <>
                        <div className={styles.basePropsTitle}>Base Props</div>
                        <BaseProps
                          instance={instance}
                          definitions={
                            getDefinitions(definition => ANIMATION_PROPS.indexOf(definition.id) === -1)
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            }}
          </UIStore.Consumer>
        )}
    </AnimationStore.Consumer>
  );
};
export default Controls;