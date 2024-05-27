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
    resume: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
    workExperience: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
    $transaction: jest.fn(async (fn: () => Promise<any>) => {
        return await fn();
    })
};

export const PrismaClient = jest.fn(() => mockPrismaClient);


