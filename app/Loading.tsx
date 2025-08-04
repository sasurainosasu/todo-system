'use client';

import React from 'react';
//import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ModalLoading = (props:boolean) => {
  return (
      <Modal show={props.isLoading} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <p>通信中...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Modal.Body>
      </Modal>
  );
};

export default ModalLoading;