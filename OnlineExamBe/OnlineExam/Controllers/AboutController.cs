using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Interfaces;
using OnlineExam.Attributes;

namespace OnlineExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutController : Controller
    {
        private readonly IAboutService _aboutService;
       public AboutController(IAboutService aboutService) 
        { 
        _aboutService = aboutService;
        }


        [HttpGet]
        [Route("about")]
        public IActionResult GetAbout()
        {
            var result = _aboutService.GetAboutAsync();
            if (result == null) 
            {
                return NotFound("Không tìm thấy tài khoản");
            }
            return Ok(result);
        }
    }
}
