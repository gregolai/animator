import { React } from 'common';
import { ButtonPrimitive, Modal } from 'components/core';

import styles from './ImportExportModal.module.css';

const ImportExportModal = ({
	cancelButtonLabel = 'Close',
	children,
	closeOnBackButton = true,
	canConfirm = false,
	confirmButtonLabel,
	isOpen,
	onConfirm,
	onRequestClose,
	position = 'center',
	title
}) => {
	return (
		isOpen && (
			<Modal closeOnBackButton={closeOnBackButton} onRequestClose={() => onRequestClose()}>
				<Modal.Backdrop />
				<Modal.Position position={position}>
					<Modal.Dialog className={styles.dialog}>
						<Modal.Dialog.Body>
							<Modal.Dialog.Body.Title>{title}</Modal.Dialog.Body.Title>
							<Modal.Dialog.Body.Message is="div">{children}</Modal.Dialog.Body.Message>
						</Modal.Dialog.Body>

						<Modal.Dialog.Footer>
							<Modal.Dialog.Footer.Button color="warning" onClick={() => onRequestClose()}>
								{cancelButtonLabel}
							</Modal.Dialog.Footer.Button>
							<ButtonPrimitive
								className={styles.btnConfirm}
								color="primary"
								label={confirmButtonLabel}
								onClick={() => {
									onConfirm();
									onRequestClose();
								}}
								isDisabled={!canConfirm}
							/>
						</Modal.Dialog.Footer>
					</Modal.Dialog>
				</Modal.Position>
			</Modal>
		)
	);
};
export default ImportExportModal;
