namespace Sample.Constants
{
    public struct ConfigurationKeys
    {
        public struct StaticData
        {
            public const string S3Bucket = "StaticData_BucketName";
            public const string WebCategoriesKey = "StaticData_WebCategoriesKey";
            public const string SubCategoriesKey = "StaticData_SubCategoriesKey";
            public const string CacheExpirationTimeSpan = "StaticData_CacheExpirationTimeSpan";
        }
    }
}