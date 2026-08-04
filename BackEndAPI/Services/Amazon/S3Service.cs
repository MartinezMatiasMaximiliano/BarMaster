using Amazon.S3;
using Amazon.S3.Model;
using global::Amazon.S3;
namespace BackEndAPI.Services.Amazon
{

    public class S3Service
    {
        //private readonly IAmazonS3 _s3;
        private readonly IConfiguration _configuration;

        public S3Service(
          //  IAmazonS3 s3,
            IConfiguration configuration)
        {
            //_s3 = s3;
            _configuration = configuration;
        }

        public async Task<Stream> ObtenerArchivo(string key)
        {
            var bucket = "barmaster-cert-vault";

            //var response = await _s3.GetObjectAsync(bucket, key);

            //return response.ResponseStream;
            throw new NotImplementedException();
        }
    }
}