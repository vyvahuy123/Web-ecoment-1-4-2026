using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Vouchers.DTOs
{
    public class ValidateVoucherDto
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
        public decimal DiscountAmount { get; set; }
    }
}
