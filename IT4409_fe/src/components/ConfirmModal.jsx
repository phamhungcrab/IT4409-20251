import { Modal } from "./Modal";
import { CommonButton } from "./Button";

export const ConfirmModal = ({
    isOpen,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    onConfirm,
    onCancel
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title}>
            <p className="text-gray-700 mb-4">{message}</p>

            <div className="flex justify-end gap-3">
                <CommonButton
                    label={cancelLabel}
                    color="gray"
                    onClick={onCancel}
                />
                <CommonButton
                    label={confirmLabel}
                    color="red"
                    onClick={onConfirm}
                />
            </div>
        </Modal>
    );
};
