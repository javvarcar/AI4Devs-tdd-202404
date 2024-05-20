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

    it('should save a valid candidate', async () => {
        const candidateData = { email: 'valid@example.com', firstName: 'Alice', lastName: 'Smith' };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 124,
            ...candidateData
        });

        const result = await addCandidate(candidateData);

        expect(mockedPrisma.candidate.create).toHaveBeenCalledWith({
            data: candidateData,
        });
        expect(result.id).toEqual(124);
    });

    it('should throw an error for invalid candidate data', async () => {
        const invalidCandidateData = { email: 'invalid-email', firstName: 'Bob', lastName: 'Smith' };

        await expect(addCandidate(invalidCandidateData)).rejects.toThrow('Invalid email');
    });

    it('should handle unique email constraint violation', async () => {
        const duplicateEmailData = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
        const error = new Error('The email already exists in the database');
        (mockedPrisma.candidate.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

        await expect(addCandidate(duplicateEmailData)).rejects.toThrow(error.message);
    });

    // Additional tests for related data like education, work experiences, and resumes can be added here
    it('should save candidate with educations', async () => {
        const candidateWithDetails = {
            ...candidateData,
            educations: [{ institution: 'Uni', title: 'Bachelor of Science', startDate: '2020-01-01' }],
        };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 123,
            ...candidateWithDetails
        });

        await addCandidate(candidateWithDetails);

        expect(mockedPrisma.education.create).toHaveBeenCalled();
    });

    it('should save candidate with resumes', async () => {
        const candidateWithResume = {
            ...candidateData,
            cv: { filePath: 'resume.pdf', fileType: 'pdf' }
        };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 123,
            ...candidateWithResume
        });
        (mockedPrisma.resume.create as jest.Mock).mockResolvedValue({
            id: 1,
            ...candidateWithResume.cv
        });

        await addCandidate(candidateWithResume);

        expect(mockedPrisma.resume.create).toHaveBeenCalledWith({
            data: {
                candidateId: 123,
                filePath: 'resume.pdf',
                fileType: 'pdf',
                uploadDate: expect.any(Date)
            }
        });
    });

    it('should save candidate with work experiences', async () => {
        const candidateWithWorkExperience = {
            ...candidateData,
            workExperiences: [{ company: 'Tech Co', position: 'Developer', startDate: '2022-02-01' }],
        };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 123,
            ...candidateWithWorkExperience
        });
    });

    it('should save a complete candidate profile', async () => {
        const completeCandidateData = {
            email: 'complete@example.com',
            firstName: 'Complete',
            lastName: 'Candidate',
            educations: [{ institution: 'University', title: 'BSc Computer Science', startDate: '2018-01-01', endDate: '2022-01-01' }],
            workExperiences: [{ company: 'Tech Co', position: 'Developer', startDate: '2022-02-01' }],
            cv: { filePath: 'complete_resume.pdf', fileType: 'pdf' }
        };
        const expectedData = {
            email: 'complete@example.com',
            firstName: 'Complete',
            lastName: 'Candidate'
        };

        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 125,
            ...completeCandidateData
        });

        await addCandidate(completeCandidateData);

        expect(mockedPrisma.candidate.create).toHaveBeenCalledWith({
            data: expectedData
        });
        expect(mockedPrisma.education.create).toHaveBeenCalled();
        expect(mockedPrisma.workExperience.create).toHaveBeenCalled();
        expect(mockedPrisma.resume.create).toHaveBeenCalled();
    });

    it('should handle candidate with partial data', async () => {
        const partialCandidateData = {
            email: 'partial@example.com',
            firstName: 'Partial',
            lastName: 'Candidate'
        };
        (mockedPrisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 126,
            ...partialCandidateData
        });

        const result = await addCandidate(partialCandidateData);

        expect(mockedPrisma.candidate.create).toHaveBeenCalledWith({
            data: partialCandidateData
        });
        expect(result.id).toEqual(126);
    });

    it('should handle database connection errors on save', async () => {
        const candidateData = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
        const dbError = new Error('Database connection error');
        (mockedPrisma.candidate.create as jest.Mock).mockRejectedValue(dbError);

        await expect(addCandidate(candidateData)).rejects.toThrow('Database connection error');

        expect(mockedPrisma.candidate.create).toHaveBeenCalledWith({
            data: candidateData
        });
    });
});

