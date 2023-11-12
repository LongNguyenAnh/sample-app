using sample.WebRequest.Models;
using Sample.Exceptions;
using Newtonsoft.Json;
using System;

namespace Sample.Extensions
{
    public static class sampleWebResponseExtensions
    {
        public static T ProcessWebResponse<T>(this sampleWebResponse webResponse, string requestUrl, bool logAllWebResponses = false)
        {
            var response = default(T);
            if (webResponse == null)
            {
                var uri = new Uri(requestUrl);
                LogWebResponse(uri.Host, "-", uri.AbsolutePath, uri.OriginalString, "-", "-", "No response received", "-");
            }
            else
            {
                if (!webResponse.Success && (int)webResponse.StatusCode >= 500 && (int)webResponse.StatusCode < 600)
                {
                    webResponse.LogWebResponse();
                    throw new sampleHttpWebException($"ExternalServiceError. Uri: {webResponse.RequestUri}. Message: {webResponse.ErrorMessage}.", webResponse.Exception, webResponse.RequestUri);
                }

                try
                {
                    response = typeof(T) == typeof(string)
                        ? (T)Convert.ChangeType(webResponse.ResponseValue, typeof(string))
                        : JsonConvert.DeserializeObject<T>(webResponse.ResponseValue);
                    if (logAllWebResponses)
                    {
                        webResponse.LogWebResponse();
                    }
                }
                catch (Exception ex)
                {
                    webResponse.LogWebResponse($"Failure deserializing response. {ex.Message}");
                }
            }

            return response;
        }

        public static void LogWebResponse(this sampleWebResponse webResponse, string errorMessage = null)
        {
            LogWebResponse(webResponse.RequestUri?.Host, webResponse.ElapsedResponseTime.TotalMilliseconds.ToString(), webResponse.RequestUri?.AbsolutePath, webResponse.RequestUri?.OriginalString, webResponse.HeaderString, webResponse.StatusCode.ToString(), errorMessage ?? webResponse.ErrorMessage, webResponse.ResponseValue);
        }

        private static void LogWebResponse(string host, string elapsedTime, string requestPath, string requestUrl, string headers, string statusCode, string errorMessage, string responseValue)
        {
            Console.WriteLine($"[WebApiResponse]. Host: {host}; Elapsed Time: {elapsedTime} ms; RequestPath: {requestPath}; RequestUrl: {requestUrl}; Headers: {headers}; Status {statusCode}; Error Message: {errorMessage}; Response Value: {responseValue}.");
        }
    }
}
