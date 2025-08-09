import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';

interface LoadingOverlayProps {
  show: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center">
        <p>通信中...</p>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingOverlay;