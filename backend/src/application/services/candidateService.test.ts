import { addCandidate } from './candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { validateCandidateData } from '../validator';
import { mocked } from 'jest-mock';

jest.mock('../validator', () => ({
    validateCandidateData: jest.fn()
}));

const mockValidateCandidateData = mocked(validateCandidateData);

// Define a custom error class with a 'code' property
class CustomError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

describe('addCandidate', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockValidateCandidateData.mockReset();
        Candidate.prototype.save = jest.fn().mockResolvedValue({ id: 1 }); // Asegúrate de que siempre devuelva un objeto con un id
        Education.prototype.save = jest.fn().mockResolvedValue({});
        WorkExperience.prototype.save = jest.fn().mockResolvedValue({});
        Resume.prototype.save = jest.fn().mockResolvedValue({});
    });

    it('should add a candidate successfully with all related entities', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            educations: [{ institution: 'Tech University', degree: 'BSc Computer Science' }],
            workExperiences: [{ company: 'Tech Corp', role: 'Developer' }],
            cv: { filePath: 'resume.pdf', fileType: 'pdf' }
        };

        Candidate.prototype.save = jest.fn().mockResolvedValue({ id: 1, ...candidateData });
        Education.prototype.save = jest.fn().mockResolvedValue({});
        WorkExperience.prototype.save = jest.fn().mockResolvedValue({});
        Resume.prototype.save = jest.fn().mockResolvedValue({});

        await addCandidate(candidateData);

        expect(Candidate.prototype.save).toHaveBeenCalled();
        expect(Education.prototype.save).toHaveBeenCalled();
        expect(WorkExperience.prototype.save).toHaveBeenCalled();
        expect(Resume.prototype.save).toHaveBeenCalled();
    });

    it('should handle unique constraint errors when the email already exists', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'existing.email@example.com',
            firstName: 'John',
            lastName: 'Doe'
        };

        Candidate.prototype.save = jest.fn().mockImplementation(() => {
            throw new CustomError('Unique constraint failed on the fields: (`email`)', 'P2002');
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });

    it('should save candidate education details when provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'unique.email.education@example.com',
            firstName: 'John',
            lastName: 'Doe',
            educations: [{ institution: 'Tech University', degree: 'BSc Computer Science' }]
        };

        await addCandidate(candidateData);

        expect(Education.prototype.save).toHaveBeenCalled();
    });

    it('should not attempt to save education details when none are provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'unique.email.noeducation@example.com',
            firstName: 'John',
            lastName: 'Doe'
        };

        await addCandidate(candidateData);

        expect(Education.prototype.save).not.toHaveBeenCalled();
    });

    it('should save candidate work experiences when provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'john.doe@example.com',
            workExperiences: [{ company: 'Tech Corp', role: 'Developer' }]
        };

        WorkExperience.prototype.save = jest.fn().mockResolvedValue({});

        await addCandidate(candidateData);

        expect(WorkExperience.prototype.save).toHaveBeenCalled();
    });

    it('should not attempt to save work experiences when none are provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'john.doe@example.com'
        };

        await addCandidate(candidateData);

        expect(WorkExperience.prototype.save).not.toHaveBeenCalled();
    });

    it('should save candidate CV when provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'john.doe@example.com',
            cv: { filePath: 'resume.pdf', fileType: 'pdf' }
        };

        Resume.prototype.save = jest.fn().mockResolvedValue({});

        await addCandidate(candidateData);

        expect(Resume.prototype.save).toHaveBeenCalled();
    });

    it('should not attempt to save CV when none are provided', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'john.doe@example.com'
        };

        await addCandidate(candidateData);

        expect(Resume.prototype.save).not.toHaveBeenCalled();
    });

    it('should propagate unexpected errors during candidate saving', async () => {
        mockValidateCandidateData.mockImplementation(() => true);
        const candidateData = {
            email: 'unexpected.error@example.com',
            firstName: 'John',
            lastName: 'Doe'
        };

        // Simulate an unexpected error during the save operation
        Candidate.prototype.save = jest.fn().mockImplementation(() => {
            throw new Error('Unexpected database error');
        });

        // Expect the addCandidate function to throw the unexpected error
        await expect(addCandidate(candidateData)).rejects.toThrow('Unexpected database error');
    });

    it('should throw an error if candidate data is invalid', async () => {
        mockValidateCandidateData.mockImplementation(() => {
            throw new Error('Invalid candidate data');
        });
        const candidateData = {
            email: 'invalid.data@example.com',
            firstName: 'John',
            lastName: 'Doe'
        };

        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid candidate data');
    });
});
