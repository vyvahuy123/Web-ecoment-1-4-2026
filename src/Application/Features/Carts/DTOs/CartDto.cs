using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Carts.DTOs
{
    public class CartDto
    {
        public Guid CartId { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public decimal GrandTotal { get; set; }
    }
}
