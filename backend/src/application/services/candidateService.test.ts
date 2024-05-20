import { PrismaClient } from '@prisma/client';
import { addCandidate } from './candidateService';

jest.mock('@prisma/client');

// Get a reference to the mocked module
const mockedPrisma = new PrismaClient();

const candidateData = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };

describe('addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate candidate data and save the candidate', async () => {
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 123,
            ...candidateData
        });

        const result = await addCandidate(candidateData);

        expect(mockedPrisma.candidate.create).toHaveBeenCalledWith({
            data: candidateData,
        });
        expect(result.id).toEqual(123);
    });

    it('should handle errors during the saving process', async () => {
        const error = new Error('Database error');
        (mockedPrisma.candidate.create as jest.Mock).mockRejectedValue(error);

        await expect(addCandidate(candidateData)).rejects.toThrow('Database error');
    });

    // Additional tests for related data like education, work experiences, and resumes can be added here
    // Example for education:
    it('should save related educations', async () => {
        const candidateWithEducations = {
            ...candidateData,
            educations: [{
                institution: 'Uni',
                title: 'Bachelor of Science',
                startDate: '2020-01-01'
            }]
        };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 123,
            ...candidateWithEducations
        });
        (mockedPrisma.education.create as jest.Mock).mockResolvedValue({
            id: 1,
            ...candidateWithEducations.educations[0]
        });

        await addCandidate(candidateWithEducations);

        expect(mockedPrisma.education.create).toHaveBeenCalledWith({
            data: {
                candidateId: 123,
                ...candidateWithEducations.educations[0],
                startDate: new Date(candidateWithEducations.educations[0].startDate) // Convert string to Date object
            }
        });
    });
});





