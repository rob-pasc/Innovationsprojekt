using Api.Application.DTOs;
using Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Application.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO request)
        {
            // Check if user exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "User with this email already exists"
                };

            // Create new user
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                TotalPoints = 0,
                ExpLvl = 1,
                OnboardingCompleted = false
            };

            // Create user with password (hashing is automatic)
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = $"User creation failed: {errors}"
                };
            }

            // Assign "User" role by default
            // B2 (known issue): CreateAsync and AddToRoleAsync are not wrapped in a transaction.
            // If AddToRoleAsync fails (e.g. role not yet seeded, transient DB error), the user
            // will exist in the database but have no role, causing all [Authorize(Roles="User")]
            // endpoints to return 403. Fix: wrap both calls in an IDbContextTransaction and
            // roll back the user creation if role assignment fails.
            await _userManager.AddToRoleAsync(user, "User");

            // Generate token so the frontend has an authenticated session immediately
            var token = await _tokenService.GenerateAccessTokenAsync(user);

            return new AuthResponseDTO
            {
                Success = true,
                Message = "User registered successfully",
                Token = token,
                User = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email!,
                    Role = "user",
                    TotalPoints = user.TotalPoints,
                    ExpLvl = user.ExpLvl,
                    OnboardingCompleted = user.OnboardingCompleted,
                    CreatedAt = user.CreatedAt
                }
            };
        }

        public async Task<AuthResponseDTO> LoginAsync(LoginRequestDTO request)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "Invalid email or password"
                };

            // Check password (UserManager handles hashing comparison)
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            if (!result.Succeeded)
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "Invalid email or password"
                };

            // Generate token
            var token = await _tokenService.GenerateAccessTokenAsync(user);

            // Get the user's primary role (take the highest privilege one)
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.Contains("Admin") ? "admin"
                     : roles.Contains("Moderator") ? "moderator"
                     : "user";

            return new AuthResponseDTO
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email!,
                    Role = role,
                    TotalPoints = user.TotalPoints,
                    ExpLvl = user.ExpLvl,
                    OnboardingCompleted = user.OnboardingCompleted,
                    CreatedAt = user.CreatedAt
                }
            };
        }
    }
}