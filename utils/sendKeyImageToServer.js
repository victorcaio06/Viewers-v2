import md5 from 'md5';
import { getPngFromBase64 } from './getPngFromBase64';
import { getPatientStudyData } from './getPatientStudyData';

export async function sendKeyImageToServer(filename, fileType, imageBase64) {
  const {
    PatientID,
    PatientName,
    StudyInstanceUID,
  } = await getPatientStudyData();

  const getBase64StringFromDataURL = dataURL =>
    dataURL.replace('data:', '').replace(/^.+,/, '');

  const imagePng = getPngFromBase64(
    getBase64StringFromDataURL(imageBase64),
    filename
  );

  const formData = new FormData();
  formData.append('file', imagePng);
  formData.append('filename', filename);
  formData.append('fileType', fileType);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const join = `${StudyInstanceUID + process.env.SECRET_MD5}`;

  const hashMd5 = md5(join);

  const { title, message, type, autoClose } = await fetch(
    `http://localhost:3333/image_key?studyUID=${StudyInstanceUID}
  &patientName=${PatientName}&patientId=${PatientID}&token=${hashMd5}`,
    {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }
  )
    .then(async response => {
      if (!response.ok) {
        const { title, message, type, autoClose } = await response.json();

        // servicesManager.services.uiNotificationService.show({
        //   title,
        //   message,
        //   type,
        //   position,
        //   duration,
        //   autoClose,
        // });

        return { title, message, type, autoClose };
      }

      const { title, message, type, autoClose } = await response.json();
      // servicesManager.services.uiNotificationService.show({
      //   title,
      //   message,
      //   type,
      //   position,
      //   duration,
      //   autoClose,
      // });

      return { title, message, type, autoClose };
    })
    .catch(error => {
      return {
        title: 'Key image',
        message: 'Error sending key image, please send the image again',
        type: 'error',
        autoClose: false,
      };
    });

  return { title, message, type, autoClose };
}
