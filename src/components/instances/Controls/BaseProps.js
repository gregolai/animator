import { React, cx, chunk } from 'common';

import { AnimationStore } from 'stores';
import {
  IconButton,
  ValueButton,
  ValueEditor
} from 'components/shared';

import styles from './BaseProps.module.scss';

const EditButton = ({ definition, isToggled, onClick, instance }) => (
  <AnimationStore.Consumer>
    {({ setInstanceDefinitionValue, getInstanceDefinitionValue }) => {

      const value = getInstanceDefinitionValue(instance.id, definition.id);
      const canClear = value !== undefined;

      return (
        <ValueButton
          accessory={canClear && (
            <IconButton
              icon="clear"
              onClick={() => setInstanceDefinitionValue(instance.id, definition.id, undefined)}
            />
          )}
          className={styles.button}
          definition={definition}
          isToggled={isToggled}
          onClick={onClick}
          value={value}
        />
      );
    }}
  </AnimationStore.Consumer>
);


const BaseProps = ({ definitions, instance }) => {
  const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

  const toggleExpanded = definitionId =>
    setExpandedDefinition(expandedDefinitionId === definitionId ? -1 : definitionId);

  const rows = chunk(definitions, 2);

  return (
    <div className={styles.container}>
      {rows.map(([definition1, definition2]) => (
        <React.Fragment key={definition1.id}>

          {/* ROW */}
          <div className={styles.row}>
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

          {/* VALUE EDITOR */}
          {(expandedDefinitionId === definition1.id ||
            (definition2 && expandedDefinitionId === definition2.id)) && (
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

export default BaseProps;