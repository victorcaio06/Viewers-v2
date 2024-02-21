import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { utils } from '@ohif/core';
import { ViewportDownloadForm } from '@ohif/ui';

import { getEnabledElement } from './state';
import { sendKeyImageToServer } from '../../../utils/sendKeyImageToServer';

const MINIMUM_SIZE = 100;
const DEFAULT_SIZE = 512;
const MAX_TEXTURE_SIZE = 10000;

const CornerstoneViewportSendForm = ({
  onClose,
  activeViewportIndex,
  servicesManager,
}) => {
  const [loading, setLoading] = useState(false);

  const activeEnabledElement = getEnabledElement(activeViewportIndex);

  const enableViewport = viewportElement => {
    if (viewportElement) {
      cornerstone.enable(viewportElement);
    }
  };

  const disableViewport = viewportElement => {
    if (viewportElement) {
      cornerstone.disable(viewportElement);
    }
  };

  const updateViewportPreview = (viewportElement, downloadCanvas, fileType) =>
    new Promise(resolve => {
      cornerstone.fitToWindow(viewportElement);

      viewportElement.addEventListener(
        'cornerstoneimagerendered',
        function updateViewport(event) {
          const enabledElement = cornerstone.getEnabledElement(event.target)
            .element;
          const type = 'image/' + fileType;
          const dataUrl = downloadCanvas.toDataURL(type, 1);

          let newWidth = enabledElement.offsetHeight;
          let newHeight = enabledElement.offsetWidth;

          if (newWidth > DEFAULT_SIZE || newHeight > DEFAULT_SIZE) {
            const multiplier = DEFAULT_SIZE / Math.max(newWidth, newHeight);
            newHeight *= multiplier;
            newWidth *= multiplier;
          }

          resolve({ dataUrl, width: newWidth, height: newHeight });

          viewportElement.removeEventListener(
            'cornerstoneimagerendered',
            updateViewport
          );
        }
      );
    });

  const loadImage = (activeViewport, viewportElement, width, height) =>
    new Promise(resolve => {
      if (activeViewport && viewportElement) {
        const enabledElement = cornerstone.getEnabledElement(activeViewport);
        const viewport = Object.assign({}, enabledElement.viewport);
        delete viewport.scale;
        viewport.translation = {
          x: 0,
          y: 0,
        };

        cornerstone.loadImage(enabledElement.image.imageId).then(image => {
          cornerstone.displayImage(viewportElement, image);
          cornerstone.setViewport(viewportElement, viewport);
          cornerstone.resize(viewportElement, true);

          const newWidth = Math.min(width || image.width, MAX_TEXTURE_SIZE);
          const newHeight = Math.min(height || image.height, MAX_TEXTURE_SIZE);

          resolve({ image, width: newWidth, height: newHeight });
        });
      }
    });

  const toggleAnnotations = (toggle, viewportElement) => {
    cornerstoneTools.store.state.tools.forEach(({ name }) => {
      if (toggle) {
        cornerstoneTools.setToolEnabledForElement(viewportElement, name);
      } else {
        cornerstoneTools.setToolDisabledForElement(viewportElement, name);
      }
    });
  };

  const downloadBlob = (
    filename,
    fileType,
    viewportElement,
    downloadCanvas
  ) => {
    if (fileType !== 'png') fileType = 'png';

    const file = `${filename}.${fileType}`;
    const mimetype = `image/${fileType}`;

    /* Handles JPEG images for IE11 */
    if (downloadCanvas.msToBlob && fileType === 'jpeg') {
      const image = downloadCanvas.toDataURL(mimetype, 1);
      const blob = utils.b64toBlob(
        image.replace('data:image/jpeg;base64,', ''),
        mimetype
      );
      return window.navigator.msSaveBlob(blob, file);
    }

    viewportElement.querySelector('canvas').toBlob(async blob => {
      const URLObj = window.URL || window.webkitURL;
      const a = document.createElement('a');
      a.href = URLObj.createObjectURL(blob);
      const image = downloadCanvas.toDataURL(mimetype, 1);
      a.href = image;
      a.download = file;

      document.body.appendChild(a);

      const {
        title,
        message,
        type,
        autoClose,
        isLoading,
      } = await sendKeyImageToServer(filename, fileType, a.href);

      document.body.removeChild(a);

      setLoading(isLoading);

      servicesManager.services.UIModalService.hide();
      servicesManager.services.UINotificationService.show({
        title,
        message,
        type,
        autoClose,
      });
    });
  };

  return (
    <ViewportDownloadForm
      onClose={onClose}
      minimumSize={MINIMUM_SIZE}
      maximumSize={MAX_TEXTURE_SIZE}
      defaultSize={DEFAULT_SIZE}
      canvasClass={'cornerstone-canvas'}
      activeViewport={activeEnabledElement}
      enableViewport={enableViewport}
      disableViewport={disableViewport}
      updateViewportPreview={updateViewportPreview}
      loadImage={loadImage}
      toggleAnnotations={toggleAnnotations}
      downloadBlob={downloadBlob}
      isLoading={loading}
      setLoading={setLoading}
      isSend
    />
  );
};

CornerstoneViewportSendForm.propTypes = {
  onClose: PropTypes.func,
  activeViewportIndex: PropTypes.number.isRequired,
  servicesManager: PropTypes.any.isRequired,
};

export default CornerstoneViewportSendForm;
