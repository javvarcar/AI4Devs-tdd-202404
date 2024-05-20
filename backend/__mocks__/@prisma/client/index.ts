import { jest } from '@jest/globals';

const mockPrismaClient = {
    candidate: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
    education: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
};

export const PrismaClient = jest.fn(() => mockPrismaClient);

