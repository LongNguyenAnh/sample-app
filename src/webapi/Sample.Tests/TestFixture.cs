using AutoMapper;
using AutoMapper.Configuration;
using System;
using Xunit;

namespace Sample.Tests
{
    public class TestFixture : IDisposable
    {
        public TestFixture()
        {
            sample.Configuration.AutoMapperConfiguration.Initialize();
        }

        public void Dispose()
        {
            Mapper.Reset();
        }
    }

    [CollectionDefinition("test collection")]
    public class TestCollection : ICollectionFixture<TestFixture>
    {

    }
}
