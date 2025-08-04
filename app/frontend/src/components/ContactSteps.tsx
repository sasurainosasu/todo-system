'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Nav } from 'react-bootstrap';
// import Link from 'next/link'; // Link は不要になるため削除
import styles from './ContactSteps.module.css';

interface Step {
  id: number;
  name: string;
  path: string;
}

const steps: Step[] = [
  { id: 1, name: '入力', path: '/contact' },
  { id: 2, name: '確認', path: '/contact/confirm' },
  { id: 3, name: '完了', path: '/contact/complete' },
];

const ContactSteps: React.FC = () => {
  const pathname = usePathname();

  const getStepStatus = (stepPath: string) => {
    if (pathname === stepPath) {
      return 'current';
    }
    const currentStepIndex = steps.findIndex(step => pathname.startsWith(step.path));
    const targetStepIndex = steps.findIndex(step => step.path === stepPath);

    if (currentStepIndex !== -1 && targetStepIndex !== -1) {
      if (targetStepIndex < currentStepIndex) {
        return 'completed';
      }
    }
    return '';
  };

  return (
    <Nav className={`${styles.contactSteps} justify-content-center mb-4`}>
      {steps.map((step) => {
        const status = getStepStatus(step.path);
        return (
          <Nav.Item key={step.id} className={`${styles.stepItem} ${styles[status] || ''}`}>
            {/* ここを Link から div に変更し、ページ遷移をなくす */}
            <div className={`${styles.stepContent} nav-link`}> {/* nav-link クラスはスタイル維持のため残しても良い */}
              <div className={styles.stepCircle}>{step.id}</div>
              <div className={styles.stepName}>{step.name}</div>
            </div>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default ContactSteps;