using System;
using System.Collections.Generic;
using System.Linq;

namespace Sample.Extensions
{
    public static class LinqExtension
    {
        public static IOrderedEnumerable<TSource> OrderBy<TSource, TKey>(this IEnumerable<TSource> list, Func<TSource, TKey> keySelector, bool isAscending)
        {
            return isAscending ? list.OrderBy(keySelector) : list.OrderByDescending(keySelector);
        }
    }
}
