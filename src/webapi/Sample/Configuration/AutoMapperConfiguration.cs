using AutoMapper;
using AutoMapper.Configuration;
using Sample.Models;
using System;
using System.Linq;

namespace Sample.Configuration
{
    public class AutoMapperConfiguration
    {
        public static void Initialize()
        {
            var cfg = new MapperConfigurationExpression();
            cfg.CreateMap<Product, Info>()
                .ForPath(d => d.Product.Id, opt => opt.MapFrom(src => src.ProductId))
                .ForPath(d => d.Product.Name, opt => opt.MapFrom(src => src.ProductName))
                .ForPath(d => d.YearId, opt => opt.MapFrom(src => src.Year))
                .ForPath(d => d.ExpertRating, opt => opt.MapFrom(src => src.ERating))
                .ForPath(d => d.Category, opt => opt.MapFrom(src => src.WebCategory != null ? src.WebCategory.Name : ""))
                .ForPath(d => d.ShortCategory, opt => opt.MapFrom(src => src.WebCategory != null ? src.WebCategory.Code : ""))
                .ForPath(d => d.SubCategory, opt => opt.MapFrom(src => src.SubCategory != null ? src.SubCategory.Code : ""))
                .ForPath(d => d.SubCategoryName, opt => opt.MapFrom(src => src.SubCategory != null ? src.SubCategory.Name : ""));
            
            Mapper.Initialize(cfg);
        }

        private static string GetDate(string dateString, string pattern)
        {
            DateTime x = DateTime.Parse(dateString);
            return x.ToString(pattern);
        }
    }
}