import md5 from 'md5';
import { getPngFromBase64 } from './getPngFromBase64';
import { getPatientStudyData } from './getPatientStudyData';

export async function sendKeyImageToServer(fileName, fileType, imageBase64) {
  const {
    PatientID,
    PatientName,
    StudyInstanceUID,
  } = await getPatientStudyData();

  const getBase64StringFromDataURL = dataURL =>
    dataURL.replace('data:', '').replace(/^.+,/, '');

  const imagePng = getPngFromBase64(
    getBase64StringFromDataURL(imageBase64),
    fileName
  );

  const formData = new FormData();
  formData.append('file', imagePng);
  formData.append('fileName', fileName);
  formData.append('fileType', fileType);

  const controller = new AbortController();
  const abortControllerTimeout = setTimeout(() => controller.abort(), 5000);

  const join = `${PatientID + process.env.SECRET_MD5}`;
  const hashMd5 = md5(join);

  const { title, message, type, autoClose } = await fetch(
    `https://new.radcloud.com.br/key_image?studyUID=${StudyInstanceUID}
    &patientName=${PatientName}&patientId=${PatientID}&token=${hashMd5}`,
    {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }
  )
    .then(async response => {
      if (response.status !== 200) {
        // const { title, message, type, autoClose } = await response.json();

        // servicesManager.services.uiNotificationService.show({
        //   title,
        //   message,
        //   type,
        //   position,
        //   duration,
        //   autoClose,
        // });

        return {
          title: 'Imagem chave',
          message: 'Envie a imagem novamente, por favor',
          type: 'error',
          autoClose: false,
        };
      }

      return {
        title: 'Imagem chave',
        message: 'Imagem enviada com sucesso!',
        type: 'success',
        autoClose: false,
      };
    })
    .catch(error => {
      return {
        title: 'Imagem chave',
        message: 'Envie a imagem novamente, por favor',
        type: 'error',
        autoClose: false,
      };
    });

  return { title, message, type, autoClose, isLoading: false };
}
