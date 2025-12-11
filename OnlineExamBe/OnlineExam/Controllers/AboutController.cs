using Microsoft.AspNetCore.Mvc;
using OnlineExam.Application.Interfaces;

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
        public async Task<IActionResult> GetAbout()
        {
            var result = await  _aboutService.GetAboutAsync();
            if (result == null) 
            {
                return NotFound("Không tìm thấy tài khoản");
            }
            return Ok(result);
        }
    }
}
