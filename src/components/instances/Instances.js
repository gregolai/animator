import { React, cx } from 'utils';

import { AnimationStore, UIStore } from 'stores';
import { AddDropdown, ColorSquare, ExpandingTitle, IconButton, Popover, ValueButton, ValueEditor } from 'components/shared';
import { getDefinition } from 'utils/definitions';

import InstanceTimeline from './InstanceTimeline';
import PlayheadCursor from './PlayheadCursor';
import PlayheadTimeline from './PlayheadTimeline';

import styles from './Instances.module.scss';



const InstanceControls = ({ instance }) => {
  const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

  return (
    <AnimationStore.Consumer>
      {({ setInstanceAnimation, setInstanceName, getAnimation, getAnimations, getInstanceDefinitionValue, setInstanceDefinitionValue }) => (
        <div>
          <div style={{ display: 'flex' }}>

            <ExpandingTitle
              accessory={<IconButton icon="close" />}
              //className={styles.title}
              isExpanded={false /*selectedInstanceId === instance.id*/}
              label={instance.name}
              onClick={() => { } /*setSelectedInstance(instance.id)*/}
              onLabelChange={name => setInstanceName(instance.id, name)}
            />

            <AddDropdown
              icon="desktop"
              label="Animation"
              label2={(
                <div style={{ display: 'flex' }}>
                  <ColorSquare color={getAnimation(instance.animId).color} />
                  <div style={{ paddingLeft: 11 }}>{getAnimation(instance.animId).name}</div>
                </div>
              )}
              options={
                getAnimations()
                  .map(anim => ({
                    icon: <ColorSquare color={anim.color} />,
                    label: anim.name,
                    value: anim.id
                  }))
              }
              onSelect={animId => {
                setInstanceAnimation(instance.id, animId)
              }}
              value={instance.animId}
            />
          </div>

          <div className={styles.controls}>
            <div style={{ display: 'flex' }}>
              {['animation-delay', 'animation-duration', 'animation-timing-function', 'animation-direction']
                .map(definitionId => {
                  return (
                    <ValueButton
                      definition={getDefinition(definitionId)}
                      isToggled={false}
                      onClick={() => setExpandedDefinition(expandedDefinitionId === definitionId ? '' : definitionId)}
                      value={getInstanceDefinitionValue(instance.id, definitionId)}
                    ></ValueButton>
                  );
                })
              }
            </div>

            {expandedDefinitionId && (
              <Popover anchor="top-left" className={styles.editor}>
                <ValueEditor
                  definitionId={expandedDefinitionId}
                  onChange={value => setInstanceDefinitionValue(instance.id, expandedDefinitionId, value)}
                  value={getInstanceDefinitionValue(instance.id, expandedDefinitionId)}
                />
              </Popover>
            )}
          </div>
        </div>
      )}
    </AnimationStore.Consumer>
  )
}

const Instance = ({ instance }) => {
  return (
    <div className={styles.instance}>
      <InstanceControls instance={instance} />
      <InstanceTimeline className={styles.timeline} instance={instance} />
    </div>
  );
}

const HeadLeft = () => {
  return (
    <div className={styles.left}>
      <AnimationStore.Consumer>
        {({ getAnimations, createInstance }) => (
          <UIStore.Consumer>
            {({ setSelectedInstance }) => (
              <AddDropdown
                label="Create Instance"
                options={
                  getAnimations().map(animation => ({
                    label: animation.name,
                    value: animation.id
                  }))
                }
                onSelect={animId => {
                  const instance = createInstance({ animId });
                  setSelectedInstance(instance.id);
                }}
              />
            )}
          </UIStore.Consumer>
        )}
      </AnimationStore.Consumer>

    </div>
  )
}

const HeadRight = () => {
  return (
    <div className={styles.right}>
      <PlayheadTimeline />
    </div>
  );
}

const Instances = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.head}>
        <HeadLeft />
        <HeadRight />
      </div>
      <div className={styles.body}>
        <AnimationStore.Consumer>
          {({ getInstances }) => getInstances().map(instance => <Instance key={instance.id} instance={instance} />)}
        </AnimationStore.Consumer>

        <PlayheadCursor />
      </div>
    </div>
  )
}
export default Instances;
