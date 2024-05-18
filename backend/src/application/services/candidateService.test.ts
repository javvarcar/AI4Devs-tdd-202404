import { PrismaClient } from '@prisma/client';
import { addCandidate } from './candidateService';
import { mockDeep, mockReset } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
    mockReset(prismaMock);
});

jest.mock('../../domain/models/Candidate', () => {
    return {
        Candidate: jest.fn().mockImplementation(() => {
            return { save: jest.fn().mockResolvedValue({ id: 1, /* other necessary properties */ }) };
        })
    };
});

jest.mock('../../domain/models/Education', () => {
    return {
        Education: jest.fn().mockImplementation(() => {
            return { save: jest.fn() };
        })
    };
});

jest.mock('../../domain/models/WorkExperience', () => {
    return {
        WorkExperience: jest.fn().mockImplementation(() => {
            return { save: jest.fn() };
        })
    };
});

jest.mock('../../domain/models/Resume', () => {
    return {
        Resume: jest.fn().mockImplementation(() => {
            return { save: jest.fn() };
        })
    };
});

jest.mock('../validator', () => {
    return {
        validateCandidateData: jest.fn()
    };
});

test('should add a candidate successfully', async () => {
    prismaMock.candidate.create.mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        address: '1234 Main St'
    });

    const candidate = await addCandidate({ name: 'John Doe' /* other fields */ });
    expect(candidate.id).toBe(1);
});


