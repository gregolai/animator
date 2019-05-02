import { React } from 'common';
import { AnimationStore } from 'stores';
import {
  AddDropdown,
  ColorSquare,
  ExpandingTitle,
  IconButton,
  Popover,
  ValueButton,
  ValueEditor
} from 'components/shared';
import { getDefinition } from 'utils/definitions';

import styles from './InstanceControls.module.scss';

const InstanceControls = ({ instance }) => {
  const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

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
        <div className={styles.container}>
          <div className={styles.head}>
            <ExpandingTitle
              accessory={
                <IconButton
                  icon="close"
                  onClick={() => deleteInstance(instance.id)}
                />
              }
              className={styles.title}
              isExpanded={false /*selectedInstanceId === instance.id*/}
              label={instance.name}
              onClick={() => {} /*setSelectedInstance(instance.id)*/}
              onLabelChange={name => setInstanceName(instance.id, name)}
            />

            <AddDropdown
              icon="desktop"
              label="Animation"
              label2={
                <div style={{ display: 'flex' }}>
                  <ColorSquare color={getAnimation(instance.animId).color} />
                  <div style={{ paddingLeft: 11 }}>
                    {getAnimation(instance.animId).name}
                  </div>
                </div>
              }
              options={getAnimations().map(anim => ({
                icon: <ColorSquare color={anim.color} />,
                label: anim.name,
                value: anim.id
              }))}
              onSelect={animId => {
                setInstanceAnimation(instance.id, animId);
              }}
              value={instance.animId}
            />
          </div>

          <div className={styles.body}>
            <div className={styles.row}>
              {[
                'animation-delay',
                'animation-duration',
                'animation-timing-function'
              ].map(definitionId => {
                return (
                  <ValueButton
                    key={definitionId}
                    className={styles.button}
                    definition={getDefinition(definitionId)}
                    isToggled={expandedDefinitionId === definitionId}
                    onClick={() =>
                      setExpandedDefinition(
                        expandedDefinitionId === definitionId
                          ? ''
                          : definitionId
                      )
                    }
                    value={getInstanceDefinitionValue(
                      instance.id,
                      definitionId
                    )}
                  />
                );
              })}
            </div>

            {expandedDefinitionId && (
              <Popover anchor="top-left" className={styles.editor}>
                <ValueEditor
                  definitionId={expandedDefinitionId}
                  onChange={value =>
                    setInstanceDefinitionValue(
                      instance.id,
                      expandedDefinitionId,
                      value
                    )
                  }
                  value={getInstanceDefinitionValue(
                    instance.id,
                    expandedDefinitionId
                  )}
                />
              </Popover>
            )}
          </div>
        </div>
      )}
    </AnimationStore.Consumer>
  );
};
export default InstanceControls;
