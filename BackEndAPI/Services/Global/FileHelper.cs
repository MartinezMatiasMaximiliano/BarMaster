using Microsoft.AspNetCore.Http;

namespace BackEndAPI.Services.Global
{
    public static class FileHelper
    {
        public static async Task<string> GuardarImagenProducto(IFormFile? imagen, string nombreProducto)
        {
            if (imagen == null || imagen.Length == 0)
            {
                return "uploads/ImagenesProductos/Placeholder.jpeg";
            }

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/ImagenesProductos/");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var originalFileName = Path.GetFileName(imagen.FileName);
            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
            var fileExtension = Path.GetExtension(originalFileName);
            
            var fileName = GenerarNombreArchivoUnico(folderPath, fileNameWithoutExtension, fileExtension);
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imagen.CopyToAsync(stream);
            }

            return $"uploads/ImagenesProductos/{fileName}";
        }

        private static string GenerarNombreArchivoUnico(string folderPath, string fileNameWithoutExtension, string fileExtension)
        {
            var fileName = $"{fileNameWithoutExtension}{fileExtension}";
            var filePath = Path.Combine(folderPath, fileName);
            int counter = 1;

            while (System.IO.File.Exists(filePath))
            {
                fileName = $"{fileNameWithoutExtension}_{counter}{fileExtension}";
                filePath = Path.Combine(folderPath, fileName);
                counter++;
            }

            return fileName;
        }
    }
}

