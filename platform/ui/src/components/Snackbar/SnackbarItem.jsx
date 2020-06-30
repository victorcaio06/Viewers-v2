import React, { useEffect } from 'react';
import classNames from 'classnames';

import SnackbarTypes from './SnackbarTypes';

const SnackbarItem = ({ options, onClose }) => {
  const handleClose = () => onClose(options.id);

  useEffect(() => {
    if (options.autoClose) {
      setTimeout(() => handleClose(), options.duration);
    }
  }, []);

  const typeClasses = {
    [SnackbarTypes.INFO]: 'bg-primary-active',
    [SnackbarTypes.WARNING]: 'bg-yellow-600',
    [SnackbarTypes.SUCCESS]: 'bg-green-600',
    [SnackbarTypes.ERROR]: 'bg-red-600'
  };

  return (
    <div
      className={classNames(
        `${options.visible ? '' : 'sb-hidden'} sb-item`,
        typeClasses[options.type]
      )}
    >
      <span className="sb-closeBtn" onClick={handleClose}>
        <span className="sb-closeIcon">x</span>
      </span>
      {options.title && <div className="sb-title">{options.title}</div>}
      {options.message && <div className="sb-message">{options.message}</div>}
    </div>
  );
};

export default SnackbarItem;
