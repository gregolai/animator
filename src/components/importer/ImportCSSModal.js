import React from 'react';
import { BooleanField, ButtonPrimitive, TextareaField, Modal } from 'components/core';
import { AnimationStore, ImporterStore } from 'stores';

import styles from './ImportCSSModal.css';

const ImportCSSModal = () => {
	const { importAnimations } = AnimationStore.use();
	const { canImport, isOpen, setOpen, errors, replace, setReplace, value, setValue } = ImporterStore.use();

	if (!isOpen) return null;

	return (
		<Modal closeOnBackButton={true} onRequestClose={() => setOpen(false)}>
			<Modal.Backdrop />
			<Modal.Position position="center">
				<Modal.Dialog className={styles.dialog}>
					<Modal.Dialog.Body>
						<Modal.Dialog.Body.Title>Import CSS</Modal.Dialog.Body.Title>
						<Modal.Dialog.Body.Message is="div">
							<TextareaField
								fieldIndex={0}
								className={styles.textarea}
								label="Paste Here"
								onChange={setValue}
								value={value}
							/>
							{errors.map((msg, i) => (
								<div key={i} style={{ color: 'red' }}>
									{msg.message}
								</div>
							))}
						</Modal.Dialog.Body.Message>
					</Modal.Dialog.Body>

					<Modal.Dialog.Footer>
						<Modal.Dialog.Footer.Button color="warning" onClick={() => setOpen(false)}>
							Cancel
						</Modal.Dialog.Footer.Button>
						<BooleanField label="Replace" onChange={setReplace} value={replace} />
						<ButtonPrimitive
							className={styles.btnImport}
							color="primary"
							label={'Import' + (replace ? ' (replace)' : '')}
							onClick={() => {
								importAnimations(value, replace); // MAGIC
								setOpen(false);
							}}
							isDisabled={!canImport}
						/>
					</Modal.Dialog.Footer>
				</Modal.Dialog>
			</Modal.Position>
		</Modal>
	);
};

export default ImportCSSModal;
