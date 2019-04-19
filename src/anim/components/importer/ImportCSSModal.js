import React from 'react';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import ButtonPrimitive from '@sqs/core-components/primitives/Button';
import ErrorText from '@sqs/core-components/primitives/ErrorText';
import TextareaField from '@sqs/core-components/fields/TextareaField';

import { Modal } from '@sqs/experimental-components';

import AnimationStore from '../../stores/AnimationStore';
import ImporterStore from '../../stores/ImporterStore';

import styles from './ImportCSSModal.scss';

const ImportCSSModal = () => (
  <ImporterStore.Consumer>
    {({ canImport, isOpen, setOpen, errors, replace, setReplace, value, setValue }) => isOpen && (
      <AnimationStore.Consumer>
        {({ importAnimations }) => (
          <Modal
            closeOnBackButton={true}
            onRequestClose={() => setOpen(false)}
          >
            <Modal.Backdrop />
            <Modal.Position position="center">
              <Modal.Dialog className={styles.dialog}>
                <Modal.Dialog.Body>
                  <Modal.Dialog.Body.Title>
                    Import CSS
                  </Modal.Dialog.Body.Title>
                  <Modal.Dialog.Body.Message is="div">
                    <TextareaField
                      fieldIndex={0}
                      className={styles.textarea}
                      label="Paste Here"
                      onChange={setValue}
                      value={value}
                    />
                    {errors.map((msg, i) => (
                      <ErrorText key={i} errors={{ message: msg.message }} />
                    ))}
                  </Modal.Dialog.Body.Message>
                </Modal.Dialog.Body>

                <Modal.Dialog.Footer>
                  <Modal.Dialog.Footer.Button color="warning" onClick={() => setOpen(false)}>
                    Cancel
                  </Modal.Dialog.Footer.Button>
                  <BooleanField
                    label="Replace"
                    onChange={setReplace}
                    value={replace}
                  />
                  <ButtonPrimitive
                    className={styles.btnImport}
                    color="primary"
                    label={'Import' + (replace ? ' (replace)' : '')}
                    onClick={() => {
                      importAnimations(value); // MAGIC
                      setOpen(false);
                    }}
                    isDisabled={!canImport}
                  ></ButtonPrimitive>
                </Modal.Dialog.Footer>
              </Modal.Dialog>

            </Modal.Position>
          </Modal>
        )}
      </AnimationStore.Consumer>
    )}
  </ImporterStore.Consumer>
);

export default ImportCSSModal;