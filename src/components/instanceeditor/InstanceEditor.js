import React from 'react';
import { AnimationStore, StageStore, UIStore } from 'stores';
import { getDefinitions } from 'utils/definitions';
import AddDropdown from 'components/shared/AddDropdown';
import ExpandingTitle from 'components/shared/ExpandingTitle';
import IconButton from 'components/shared/IconButton';
import ValueButton from 'components/shared/ValueButton';
import CreateInstance from './CreateInstance';
import styles from './InstanceEditor.scss';

// const DeleteButton = ({ onClick, enabled }) => (
//   <IconButton
//     className={classnames(styles.btnDeleteAnimation, {
//       [styles.hidden]: !enabled
//     })}
//     isDisabled={!enabled}
//     onClick={onClick}
//   >
//     <Icon name="close" />
//   </IconButton>
// )

const InstanceHead = ({ instance }) => (

  <UIStore.Consumer>
    {({ selectedInstanceId, setSelectedInstance }) => (
      <div className={styles.head}>
        <ExpandingTitle
          accessory={
            <StageStore.Consumer>
              {({ deleteInstance }) => (
                <IconButton
                  icon="close"
                  onClick={() => deleteInstance(instance.id)}
                />
              )}
            </StageStore.Consumer>
          }
          className={styles.title}
          isExpanded={selectedInstanceId === instance.id}
          label={instance.name}
          onClick={() => setSelectedInstance(instance.id)}
        />
        <StageStore.Consumer>
          {({ setInstanceAnimation }) => (
            <AnimationStore.Consumer>
              {({ getAnimation, getAnimations }) => (
                <AddDropdown
                  icon="desktop"
                  label="Animation"
                  label2={getAnimation(instance.animId).name}
                  options={
                    getAnimations()
                      .map(anim => ({
                        label: anim.name,
                        value: anim.id
                      }))
                  }
                  onSelect={animId => {
                    setInstanceAnimation(instance.id, animId)
                  }}
                  value={instance.animId}
                />
              )}
            </AnimationStore.Consumer>

          )}
        </StageStore.Consumer>
      </div>
    )}
  </UIStore.Consumer>
);

const Instance = ({ instance }) => (
  <UIStore.Consumer>
    {({ selectedInstanceId }) => (
      <div>
        <InstanceHead instance={instance} />
        {selectedInstanceId === instance.id && (
          <div className={styles.definitions}>
            {getDefinitions().map(definition => (
              <ValueButton
                key={definition.id}
                className={styles.definition}
                definition={definition}
                isToggled={false}
                onClick={() => { }}
                value={instance.definitionValues[definition.id]}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </UIStore.Consumer>
);

const InstanceEditor = () => {
  return (
    <div>
      <CreateInstance />
      <StageStore.Consumer>
        {({ getInstances }) => (
          <div>
            {getInstances().map(instance => (
              <Instance
                key={instance.id}
                instance={instance}
              />
            ))}
          </div>
        )}
      </StageStore.Consumer>
    </div>
  );
};
export default InstanceEditor;