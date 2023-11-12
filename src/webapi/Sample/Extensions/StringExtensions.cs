using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Sample.Extensions
{
    /// <summary>
    /// Class StringExtensions.
    /// </summary>
    public static class StringExtensions
    {
        /// <summary>
        /// Extracts the alpha numeric only.
        /// </summary>
        /// <param name="input">The input string.</param>
        /// <param name="maxCharCount">The max characters to return.</param>
        /// <returns>System.String.</returns>
        public static string RemoveNonAlphaNumeric(this string input, int maxCharCount = -1)
        {
            string returnValue = input;
            if (!string.IsNullOrEmpty(input))
            {
                returnValue = string.Concat(input.Where(c => char.IsLetterOrDigit(c)));
                if (maxCharCount > 0 && returnValue.Length > maxCharCount)
                {
                    returnValue = returnValue.Substring(0, maxCharCount);
                }
            }

            return returnValue;
        }

        /// <summary>
        /// Removes all white spaces from a given string.
        /// </summary>
        /// <param name="input">The input string.</param>
        /// <returns>System.String.</returns>
        public static string RemoveWhiteSpace(this string s)
        {
            return s.Replace(" ", string.Empty);
        }

        /// <summary>
        /// Kindas the equals.
        /// </summary>
        /// <param name="s">The s.</param>
        /// <param name="value">The value.</param>
        /// <returns><c>true</c> if XXXX, <c>false</c> otherwise.</returns>
        public static bool KindaEquals(this string s, string value)
        {
            return !string.IsNullOrEmpty(s) && !string.IsNullOrEmpty(value) && s.RemoveNonAlphaNumeric().Equals(value.RemoveNonAlphaNumeric(), StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Removes anchor tags.
        /// </summary>
        /// <param name="s">The input string</param>
        /// <returns>String.</returns>
        public static string ClearHtmlLinks(this string s)
        {
            if (!string.IsNullOrEmpty(s))
            {
                s = Regex.Replace(s, @"(<a>|</a>|</?a [^>]*?>)", "", RegexOptions.IgnoreCase | RegexOptions.Compiled);
            }
            return s;
        }

        public static string MD5Crypto(this string input)
        {
            var md5 = new MD5CryptoServiceProvider();
            byte[] byteArray = Encoding.ASCII.GetBytes(input);
            byteArray = md5.ComputeHash(byteArray);
            return BitConverter.ToString(byteArray);
        }

        /// <summary>
        /// Adds query parameters to the given string (i.e. a request url).
        /// </summary>
        /// <param name="s">The input string</param>
        /// <returns>String</returns>
        public static string AddQueryParams(this string requestUrl, Dictionary<string, object> apiParams)
        {
            return string.IsNullOrEmpty(requestUrl) ? requestUrl : $"{requestUrl}{(requestUrl.Contains('?') ? "&" : "?")}{apiParams.AsQueryString()}";
        }


        /// <summary>
        /// Compresses a given string via gzip to base64
        /// </summary>
        /// <param name="s">The input string</param>
        /// <returns>String</returns>
        public static string Compress(this string s)
        {
            var bytes = Encoding.UTF8.GetBytes(s);
            using (var memoryStream = new MemoryStream())
            {
                using (var gzipStream = new GZipStream(memoryStream, CompressionMode.Compress))
                {
                    gzipStream.Write(bytes, 0, bytes.Length);
                }
                return Convert.ToBase64String(memoryStream.ToArray());
            }
        }

        /// <summary>
        /// Decompresses a base64 encoded string via gzip
        /// </summary>
        /// <param name="s">The input string</param>
        /// <returns>String</returns>
        public static string Decompress(this string s)
        {
            var bytes = Convert.FromBase64String(s);
            using (var memoryStreamInput = new MemoryStream(bytes))
            using (var memoryStreamOutput = new MemoryStream())
            {
                using (var gzipStream = new GZipStream(memoryStreamInput, CompressionMode.Decompress))
                {
                    gzipStream.CopyTo(memoryStreamOutput);
                }
                return Encoding.UTF8.GetString(memoryStreamOutput.ToArray());
            }
        }
    }
}
