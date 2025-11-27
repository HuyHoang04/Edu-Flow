import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID') || 'dummy_client_id',
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || 'dummy_client_secret',
            callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/api/auth/google/callback',
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/gmail.send', // For sending emails
            ],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        const user = {
            googleId: id,
            email: emails[0].value,
            name: name.givenName + ' ' + name.familyName,
            avatarUrl: photos[0].value,
            accessToken,
            refreshToken,
        };

        done(null, user);
    }
}
