export function getStudyUID() {
  const currentURL = window.location.href;
  const studyUID = currentURL.split('viewer/')[1];

  return studyUID;
}
