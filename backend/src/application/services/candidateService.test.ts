import { addCandidate } from './candidateService';
import * as validator from '../validator';

// Define reusable mock implementations
const mockCandidate = {
    save: jest.fn().mockResolvedValue({ id: 123 }),
    education: [],
    workExperience: [],
    resumes: []
};

const mockEducation = {
    save: jest.fn().mockResolvedValue({})
};

const mockExperience = {
    save: jest.fn().mockResolvedValue({})
};

const mockResume = {
    save: jest.fn().mockResolvedValue({})
};

// Set up mocks with these implementations
jest.mock('../../domain/models/Candidate', () => ({
    Candidate: jest.fn(() => mockCandidate)
}));

jest.mock('../../domain/models/Education', () => ({
    Education: jest.fn(() => mockEducation)
}));

jest.mock('../../domain/models/WorkExperience', () => ({
    WorkExperience: jest.fn(() => mockExperience)
}));

jest.mock('../../domain/models/Resume', () => ({
    Resume: jest.fn(() => mockResume)
}));

jest.mock('../validator', () => ({
    validateCandidateData: jest.fn()
}));

describe('addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock implementations if necessary
        mockCandidate.save.mockResolvedValue({ id: 123 });
    });

    it('should validate candidate data', async () => {
        const candidateData = { email: 'test@example.com' };
        await addCandidate(candidateData);
        expect(validator.validateCandidateData).toHaveBeenCalledWith(candidateData);
    });

    it('should throw an error if validation fails', async () => {
        const candidateData = { email: 'bad-email' };
        (validator.validateCandidateData as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Invalid data');
        });
        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid data');
    });

    it('should save the candidate and return the saved data', async () => {
        const candidateData = { email: 'test@gmail.com' };
        await expect(addCandidate(candidateData)).resolves.toEqual({ id: 123 });
        expect(mockCandidate.save).toHaveBeenCalled();
    });

    it('should save related educations', async () => {
        const candidateData = { email: 'test@example.com', educations: [{ institution: 'Uni', startDate: '2020-01-01' }] };
        await addCandidate(candidateData);
        expect(mockEducation.save).toHaveBeenCalled();
        expect(mockCandidate.education).toContain(mockEducation);
    });

    it('should save related work experiences', async () => {
        const candidateData = { email: 'test@example.com', workExperiences: [{ company: 'Company', startDate: '2020-01-01' }] };
        await addCandidate(candidateData);
        expect(mockExperience.save).toHaveBeenCalled();
        expect(mockCandidate.workExperience).toContain(mockExperience);
    });

    it('should save CV if provided', async () => {
        const candidateData = { email: 'test@example.com', cv: { filePath: 'path/to/cv.pdf', fileType: 'pdf' } };
        await addCandidate(candidateData);
        expect(mockResume.save).toHaveBeenCalled();
        expect(mockCandidate.resumes).toContain(mockResume);
    });

    it('should handle general errors during saving process', async () => {
        const candidateData = { email: 'test@example.com' };
        const error = new Error('Database error');
        mockCandidate.save.mockRejectedValue(error);
        await expect(addCandidate(candidateData)).rejects.toThrow('Database error');
    });
});



