
import { SignInDto } from '../dto/signin.dto'
import { SignUpDto } from '../dto/signup.dto'

export interface IAuthService {

  signIn(signInDto: SignInDto): Promise<ISignInResponse>
  signUp(signUpDto: SignUpDto): Promise<ISignUpResponse>
  signOut(userId: string): ISignOutResponse
  refreshToken(refreshToken: string): Promise<IRefreshTokenResponse>

}

export interface ISignInResponse {
  accessToken: string,
  refreshToken: string,
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
  }
}

export interface ISignUpResponse {
  accessToken: string,
  refreshToken: string,
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
  }
}

export interface ISignOutResponse {
  message: string
}

export interface IRefreshTokenResponse {
  accessToken: string,
  refreshToken: string,
}