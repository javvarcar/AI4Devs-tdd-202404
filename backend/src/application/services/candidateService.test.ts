import { addCandidate } from './candidateService';
import { validateCandidateData } from '../validator';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

jest.mock('../validator');
jest.mock('../../domain/models/Candidate');
jest.mock('../../domain/models/Education');
jest.mock('../../domain/models/WorkExperience');
jest.mock('../../domain/models/Resume');
jest.mock('@prisma/client');

const prisma = new PrismaClient();

describe('addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a candidate successfully', async () => {
        const candidateData = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            educations: [{ degree: 'BSc', institution: 'University' }],
            workExperiences: [{ company: 'Company', role: 'Developer' }],
            cv: { fileName: 'resume.pdf', fileContent: '...' }
        };

        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (Education.prototype.save as jest.Mock).mockResolvedValue({});
        (WorkExperience.prototype.save as jest.Mock).mockResolvedValue({});
        (Resume.prototype.save as jest.Mock).mockResolvedValue({});

        const mockSave = jest.fn().mockResolvedValue({ id: 1 });
        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: []
        }));

        const result = await addCandidate(candidateData);

        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
        expect(result).toEqual({ id: 1 });
        expect(Education.prototype.save).toHaveBeenCalledWith(1);
        expect(WorkExperience.prototype.save).toHaveBeenCalled();
        expect(Resume.prototype.save).toHaveBeenCalled();
    });

    it('should throw a general error', async () => {
        const candidateData = { /* valid data */ };
        (validateCandidateData as jest.Mock).mockImplementation(() => { });

        const mockSave = jest.fn().mockRejectedValue(new Error('General Error'));
        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: []
        }));

        await expect(addCandidate(candidateData)).rejects.toThrow('General Error');
    });

    it('should throw an error if validateCandidateData throws an error', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            throw new Error('Validation Error');
        });

        await expect(addCandidate({})).rejects.toThrow('Validation Error');
    });

    it('should throw an error if unique constraint fails', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            throw { code: 'P2002' };
        });

        await expect(addCandidate({})).rejects.toThrow('The email already exists in the database');
    });

    it('should throw a general error if any other error occurs', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            throw new Error('General Error');
        });

        await expect(addCandidate({})).rejects.toThrow('General Error');
    });

    it('should save candidate with educations', async () => {
        const mockSave = jest.fn().mockResolvedValue({ id: 1 });
        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: [],
        }));
        (Education as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({}),
        }));
        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            return await callback();
        });

        const candidateData = {
            educations: [{ degree: 'BSc', institution: 'University' }],
        };

        await addCandidate(candidateData);

        expect(Candidate).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(Education).toHaveBeenCalledWith(candidateData.educations[0]);
    });

    it('should save candidate without educations', async () => {
        const mockSave = jest.fn().mockResolvedValue({ id: 1 });
        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: [],
        }));
        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            return await callback();
        });

        const candidateData = {};

        await addCandidate(candidateData);

        expect(Candidate).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(Education).not.toHaveBeenCalled();
    });
});