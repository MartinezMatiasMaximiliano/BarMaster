using System.Security.Cryptography;

namespace BackEndAPI.Services
{
    public static class Helpers
    {
        public static string CrearCodigoMesa()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] codigo = new byte[4];
                rng.GetBytes(codigo);

                string base64String = Convert.ToBase64String(codigo)
                                        .Replace("+", "a")
                                        .Replace("/", "b")
                                        .Replace("=", "c");
                return (base64String.ToUpper().Substring(0,5));
            }
        }

        public static string CrearPINServicio()
        {
            Random random = new Random();
            int pinNumber = random.Next(1000, 10000);  // Generates a random number between 1000 and 9999
            return pinNumber.ToString();  // Converts the number to a string

        }

    }
}

