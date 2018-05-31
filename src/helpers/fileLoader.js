export default function loadFile(type, file) {
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
    switch (type) {
      case 'image':
        return reader.readAsDataURL(file);
      case 'table':
        const text = reader.readAsText(file);
        return csvParse(text);
      default:
        return reader.readAsText(file);
    }
  });
}
