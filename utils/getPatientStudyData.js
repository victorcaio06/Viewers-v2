import RetrieveMetadata from '../platform/core/src/studies/services/wado/retrieveMetadata';
import { getStudyUID } from './getStudyId';

export async function getPatientStudyData() {
  const studyInstanceUID = getStudyUID();

  const server = {
    name: 'DCM4CHEE',
    wadoUriRoot:
      'https://mskdown.radcloud.com.br:8443/dcm4chee-arc/aets/DCM4CHEE/wado',
    qidoRoot:
      'https://mskdown.radcloud.com.br:8443/dcm4chee-arc/aets/DCM4CHEE/rs',
    wadoRoot:
      'https://mskdown.radcloud.com.br:8443/dcm4chee-arc/aets/DCM4CHEE/rs',
    qidoSupportsIncludeField: true,
    imageRendering: 'wadors',
    thumbnailRendering: 'wadors',
    enableStudyLazyLoad: true,
    supportsFuzzyMatching: true,
    type: 'dicomWeb',
    active: true,
  };

  const retrieveMetadata = new RetrieveMetadata(server, studyInstanceUID);
  const { PatientID, PatientName, StudyInstanceUID } = await retrieveMetadata;

  return { PatientID, PatientName, StudyInstanceUID };
}
