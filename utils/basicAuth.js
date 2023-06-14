import crypto from 'crypto';
import User from './users';

class BasicAuth {
  static authorizationHeader(request) {
    if (request === null) {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(request.headers, 'authorization')) {
      return null;
    }
    return request.headers.authorization;
  }

  static extractBase64AuthorizationHeader(authorizationHeader) {
    if (
      authorizationHeader === null
      || typeof authorizationHeader !== 'string'
    ) {
      return null;
    }

    if (!authorizationHeader.startsWith('Basic ')) {
      return null;
    }

    return authorizationHeader.slice(6);
  }

  static decodeBase64AuthorizationHeader(base64AuthorizationHeader) {
    if (
      base64AuthorizationHeader === null
      || typeof base64AuthorizationHeader !== 'string'
    ) {
      return null;
    }

    try {
      const decoded = Buffer.from(base64AuthorizationHeader, 'base64').toString('utf-8');
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static extractUserCredentials(decodedBase64AuthorizationHeader) {
    if (
      decodedBase64AuthorizationHeader === null
      || typeof decodedBase64AuthorizationHeader !== 'string'
    ) {
      return [null, null];
    }

    if (!decodedBase64AuthorizationHeader.includes(':')) {
      return [null, null];
    }

    const [userEmail, userPwd] = decodedBase64AuthorizationHeader.split(
      ':',
      2,
    );
    return [userEmail, userPwd];
  }

  static async userFromCredentials(userEmail, userPwd) {
    if (
      userEmail === null
      || typeof userEmail !== 'string'
      || userPwd === null
      || typeof userPwd !== 'string'
    ) {
      return false;
    }

    const userPwds = crypto.createHash('SHA1').update(userPwd).digest('hex')
      .toLowerCase();
    const us = new User();
    const user = await us.findUserByEmail(userEmail, userPwds);
    return user;
  }

  static async currentUser(request) {
    const authHeader = BasicAuth.authorizationHeader(request);
    const eBase64 = BasicAuth.extractBase64AuthorizationHeader(authHeader);
    const dBase64 = BasicAuth.decodeBase64AuthorizationHeader(eBase64);
    const [userEmail, userPwd] = BasicAuth.extractUserCredentials(dBase64);
    const user = await BasicAuth.userFromCredentials(userEmail, userPwd);
    return user;
  }
}

export default BasicAuth;
