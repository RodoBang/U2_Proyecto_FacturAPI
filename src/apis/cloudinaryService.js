const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'delu6tduu', // Reemplaza con tu Cloud Name
  api_key: '825461879386623',       // Reemplaza con tu API Key
  api_secret: 'NaALoYH80Lh3jlqXzH_DZ5sJBiE', // Reemplaza con tu API Secret
});

async function subirArchivoCloudinary(rutaArchivo) {
  try {
    console.log(`Subiendo archivo ${rutaArchivo} a Cloudinary...`);
    const result = await cloudinary.uploader.upload(rutaArchivo, {
      folder: 'facturas', // Carpeta en Cloudinary donde se guardarán las facturas
      resource_type: 'raw', // Indica que es un archivo y no una imagen
    });

    console.log(`Archivo subido exitosamente: ${result.secure_url}`);
    return result.secure_url; // URL pública del archivo
  } catch (error) {
    console.error('Error subiendo archivo a Cloudinary:', error.message || error);
    throw new Error('No se pudo subir el archivo a Cloudinary.');
  }
}

module.exports = { subirArchivoCloudinary };
