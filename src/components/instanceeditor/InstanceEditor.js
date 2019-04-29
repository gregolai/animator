import React from 'react';
import chunk from 'lodash/chunk';
import { AnimationStore, UIStore } from 'stores';
import { getDefinitions } from 'utils/definitions';
import { ValueButton, ValueEditor } from 'components/shared';
import CreateInstance from './CreateInstance';
import styles from './InstanceEditor.scss';

import InstanceHead from './InstanceHead';

const EditButton = ({ definition, isToggled, onClick, instance }) => (
  <AnimationStore.Consumer>
    {({ getInstanceDefinitionValue }) => (
      <ValueButton
        className={styles.definition}
        definition={definition}
        isToggled={isToggled}
        onClick={onClick}
        value={getInstanceDefinitionValue(instance.id, definition.id)}
      />
    )}
  </AnimationStore.Consumer>
)

const Definitions = ({ instance }) => {
  const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

  const toggleExpanded = definitionId =>
    setExpandedDefinition(expandedDefinitionId === definitionId ? -1 : definitionId);

  const rows = chunk(getDefinitions(), 2);

  return (
    <div>
      {rows.map(([definition1, definition2]) => (
        <React.Fragment key={definition1.id}>
          <div className={styles.buttons}>
            <EditButton
              definition={definition1}
              isToggled={expandedDefinitionId === definition1.id}
              onClick={() => toggleExpanded(definition1.id)}
              instance={instance}
            />
            {definition2 && (
              <EditButton
                definition={definition2}
                isToggled={expandedDefinitionId === definition2.id}
                onClick={() => toggleExpanded(definition2.id)}
                instance={instance}
              />
            )}
          </div>

          {
            (expandedDefinitionId === definition1.id ||
              (definition2 && expandedDefinitionId === definition2.id))
            && (
              <AnimationStore.Consumer>
                {({ getInstanceDefinitionValue, setInstanceDefinitionValue }) => (
                  <ValueEditor
                    definitionId={expandedDefinitionId}
                    value={getInstanceDefinitionValue(instance.id, expandedDefinitionId)}
                    onChange={value =>
                      setInstanceDefinitionValue(instance.id, expandedDefinitionId, value)
                    }
                  />
                )}
              </AnimationStore.Consumer>
            )}
        </React.Fragment>
      ))}
    </div>
  );
}

const Instance = ({ instance }) => {
  return (
    <UIStore.Consumer>
      {({ selectedInstanceId }) => (
        <div>
          <InstanceHead instance={instance} />
          {selectedInstanceId === instance.id && (
            <Definitions instance={instance} />
          )}
        </div>
      )}
    </UIStore.Consumer>
  );
}

class InstanceEditor extends React.Component {

  state = {
    expandedDefinitionId: ''
  }

  render() {
    return (
      <div>
        <CreateInstance />
        <AnimationStore.Consumer>
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
        </AnimationStore.Consumer>
      </div>
    );
  }
};
export default InstanceEditor;