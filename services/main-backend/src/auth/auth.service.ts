import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateGoogleUser(googleUser: any): Promise<User> {
        // Check if user exists
        let user = await this.usersService.findByGoogleId(googleUser.googleId);

        if (!user) {
            // Create new user
            user = await this.usersService.create({
                googleId: googleUser.googleId,
                email: googleUser.email,
                name: googleUser.name,
                avatarUrl: googleUser.avatarUrl,
                accessToken: googleUser.accessToken,
                refreshToken: googleUser.refreshToken,
                role: 'teacher',
            });
        } else {
            // Update existing user tokens
            user = await this.usersService.update(user.id, {
                accessToken: googleUser.accessToken,
                refreshToken: googleUser.refreshToken,
                avatarUrl: googleUser.avatarUrl,
            });
        }

        // Update last login
        await this.usersService.updateLastLogin(user.id);

        return user;
    }

    async login(user: User) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        };
    }

    async loginStudent(student: any) {
        const payload = { sub: student.id, role: 'student', code: student.code };
        return {
            access_token: this.jwtService.sign(payload),
            student: {
                id: student.id,
                name: student.name,
                code: student.code,
                role: 'student',
            },
        };
    }
}
