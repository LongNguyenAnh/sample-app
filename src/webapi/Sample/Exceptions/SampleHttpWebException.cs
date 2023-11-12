using Sample.WebRequest.Models;
using System;

namespace Sample.Sample.Exceptions
{
    public class SampleHttpWebException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SampleHttpWebException"/> class.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <param name="httpRequestUri">the http request uri</param>
        /// <param name="httpRequestResponse">the http request response</param>
        public SampleHttpWebException(string message, Uri httpRequestUri, string httpRequestResponse = null) : base(message)
        {
            HttpRequestUri = httpRequestUri;
            HttpRequestResponse = httpRequestResponse;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SampleHttpWebException"/> class.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <param name="innerException">The inner exception.</param>
        /// <param name="httpRequestUri">the http request uri</param>
        /// <param name="httpRequestResponse">the http request response</param>
        public SampleHttpWebException(string message, Exception innerException, Uri httpRequestUri, string httpRequestResponse = null) : base(message, innerException)
        {
            HttpRequestUri = httpRequestUri;
            HttpRequestResponse = httpRequestResponse;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SampleWebException"/> class.
        /// </summary>
        /// <param name="webResponse">the web response</param>
        public SampleHttpWebException(SampleWebResponse webResponse) : base(webResponse.ErrorMessage, webResponse.Exception)
        {
            HttpRequestUri = webResponse.RequestUri;
            HttpRequestResponse = webResponse.ResponseValue;
        }

        /// <summary>
        /// gets or sets the Http Request Uri
        /// </summary>
        public Uri HttpRequestUri { get; set; }

        /// <summary>
        /// gets or sets the Http Request Response
        /// </summary>
        public string HttpRequestResponse { get; set; }
    }
}
