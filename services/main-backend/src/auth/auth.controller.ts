import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Req() req: Request) {
        // Initiates Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(GoogleOAuthGuard)
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        // Validate and create/update user
        const user = await this.authService.validateGoogleUser(req.user);

        // Generate JWT token
        const { access_token, user: userData } = await this.authService.login(user);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: Request) {
        return req.user;
    }

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Res() res: Response) {
        // Clear any server-side session if needed
        return res.json({ message: 'Logged out successfully' });
    }
}
