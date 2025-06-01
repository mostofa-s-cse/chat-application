import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.ts';

interface AuthRequest extends Request {
  rootUserId?: string;
  token?: string;
  rootUser?: any;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already Exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = jwt.sign({ email }, process.env.SECRET!, { expiresIn: '24h' });

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    res.json({ message: 'success', token });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).send(error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(200).json({ message: 'User does not exist' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(200).json({ message: 'Invalid Credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET!, { expiresIn: '24h' });
    
    res.cookie('userToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.status(200).json({ token, status: 200 });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const validUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.rootUserId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const validUser = await prisma.user.findUnique({
      where: { id: req.rootUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!validUser) {
      res.json({ message: 'user is not valid' });
      return;
    }

    res.status(201).json({
      user: validUser,
      token: req.token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.CLIENT_ID) {
      throw new Error('CLIENT_ID environment variable is not set');
    }

    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });

    const { email_verified, email, name, picture } = verify.getPayload()!;
    if (!email_verified || !email || !name) {
      res.json({ message: 'Invalid Google Account' });
      return;
    }

    const userExist = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (userExist) {
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ token: tokenId, user: userExist });
      return;
    }

    const password = email + process.env.CLIENT_ID;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = await prisma.user.create({
      data: {
        firstName: name as string,
        lastName: name as string,
        profilePic: picture,
        password: hashedPassword,
        email: email as string,
      }
    });

    res.cookie('userToken', tokenId, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'User registered Successfully', token: tokenId });
  } catch (error) {
    console.error('error in googleAuth backend:', error);
    res.status(500).json({ error });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.rootUserId } },
          {
            OR: [
              { firstName: { contains: search.toLowerCase() } },
              { lastName: { contains: search.toLowerCase() } },
              { email: { contains: search.toLowerCase() } }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const selectedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.status(200).json(selectedUser);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateInfo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { bio, firstName, lastName } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, bio },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error });
  }
}; 