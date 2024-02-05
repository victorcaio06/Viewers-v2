export function getPngFromBase64(string64, fileName) {
  const trimmedString = string64.replace('dataimage/jpegbase64', '');
  const imageContent = atob(trimmedString);
  const buffer = new ArrayBuffer(imageContent.length);
  const view = new Uint8Array(buffer);

  for (let n = 0; n < imageContent.length; n++) {
    view[n] = imageContent.charCodeAt(n);
  }
  const type = 'image/jpeg';
  const blob = new Blob([buffer], { type });
  return new File([blob], fileName, {
    lastModified: new Date().getTime(),
    type,
  });
}
