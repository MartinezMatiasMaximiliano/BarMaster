using Amazon.S3;
using Amazon.S3.Model;

namespace BackEndAPI.Services.Amazon
{
    public class S3Service
    {
        private readonly IAmazonS3 _s3;
        private readonly string _bucket;

        public S3Service(IAmazonS3 s3, IConfiguration configuration)
        {
            _s3 = s3;
            // Configurable, con el nombre que ya se usaba hardcodeado como default para no
            // romper nada si todavía no se agregó la config.
            _bucket = configuration["Arca:S3BucketCertificados"] ?? "barmaster-cert-vault";
        }
         public async Task<byte[]> ObtenerArchivo(string key)
        {
            using var response = await _s3.GetObjectAsync(new GetObjectRequest
            {
                BucketName = _bucket,
                Key = key
            });

            using var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task SubirArchivo(string key, Stream contenido, string contentType = "application/octet-stream")
        {
            await _s3.PutObjectAsync(new PutObjectRequest
            {
                BucketName = _bucket,
                Key = key,
                InputStream = contenido,
                ContentType = contentType
            });
        }
    }
}
