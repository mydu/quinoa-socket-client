export function loadImage(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
      reader = undefined;
    };
    reader.onerror = (event) => {
      reject(event.target.error);
      reader = undefined;
    };
    reader.readAsDataURL(file);
  });
}

export function getFileAsText(fileToRead, callback) {
  let reader = new FileReader();
  // Handle errors load
  reader.onload = (event) => {
    callback(null, event.target.result);
    reader = undefined;
  };
  reader.onerror = (event) => {
    callback(event.target.error);
    reader = undefined;
  };
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
}
