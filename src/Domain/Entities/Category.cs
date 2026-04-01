using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public sealed class Category : BaseEntity
    {
        public string Name { get; private set; } = default!;
        public string? Description { get; private set; }

        private Category() { }

        public static Result<Category> Create(string name, string? description = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure<Category>("Tên danh mục không được để trống.");

            return Result.Success(new Category { Name = name.Trim(), Description = description });
        }
    }
}

