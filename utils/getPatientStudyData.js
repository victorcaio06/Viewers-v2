import RetrieveMetadata from '../platform/core/src/studies/services/wado/retrieveMetadata';
import { getStudyUID } from './getStudyId';

export async function getPatientStudyData() {
  const studyInstanceUID = getStudyUID();

  const server = {
    name: 'DCM4CHEE',
    wadoUriRoot:
      'http://msk-viewer.radcloud.com.br:8080/dcm4chee-arc/aets/DCM4CHEE/wado',
    qidoRoot:
      'http://msk-viewer.radcloud.com.br:8080/dcm4chee-arc/aets/DCM4CHEE/rs',
    wadoRoot:
      'http://msk-viewer.radcloud.com.br:8080/dcm4chee-arc/aets/DCM4CHEE/rs',
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
