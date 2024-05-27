import { addCandidate, getCandidate } from './candidateService';
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

    const candidateData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        educations: [{ degree: 'BSc', institution: 'University' }],
        workExperiences: [{ company: 'Company', role: 'Developer' }],
        cv: { fileName: 'resume.pdf', fileContent: '...' }
    };

    test.each([
        {
            description: 'should add a candidate successfully',
            candidateData,
            mockSave: jest.fn().mockResolvedValue({ id: 1 }),
            expected: { id: 1 },
            validateError: null,
            saveError: null,
            uniqueConstraintError: null
        },
        {
            description: 'should throw a general error',
            candidateData,
            mockSave: jest.fn().mockRejectedValue(new Error('General Error')),
            expected: 'General Error',
            validateError: null,
            saveError: 'General Error',
            uniqueConstraintError: null
        },
        {
            description: 'should throw an error if validateCandidateData throws an error',
            candidateData: {},
            mockSave: jest.fn(),
            expected: 'Validation Error',
            validateError: 'Validation Error',
            saveError: null,
            uniqueConstraintError: null
        },
        {
            description: 'should throw an error if unique constraint fails',
            candidateData: {},
            mockSave: jest.fn(),
            expected: 'The email already exists in the database',
            validateError: null,
            saveError: null,
            uniqueConstraintError: { code: 'P2002' }
        },
        {
            description: 'should throw a general error if any other error occurs',
            candidateData: {},
            mockSave: jest.fn(),
            expected: 'General Error',
            validateError: null,
            saveError: 'General Error',
            uniqueConstraintError: null
        },
        {
            description: 'should save candidate education successfully',
            candidateData: {
                ...candidateData,
                educations: [{ degree: 'BSc', institution: 'University' }]
            },
            mockSave: jest.fn().mockResolvedValue({ id: 1 }),
            expected: { id: 1 },
            validateError: null,
            saveError: null,
            uniqueConstraintError: null
        },
        {
            description: 'should save candidate work experience successfully',
            candidateData: {
                ...candidateData,
                workExperiences: [{ company: 'Company', role: 'Developer' }]
            },
            mockSave: jest.fn().mockResolvedValue({ id: 1 }),
            expected: { id: 1 },
            validateError: null,
            saveError: null,
            uniqueConstraintError: null
        },
        {
            description: 'should save candidate CV successfully',
            candidateData: {
                ...candidateData,
                cv: { fileName: 'resume.pdf', fileContent: '...' }
            },
            mockSave: jest.fn().mockResolvedValue({ id: 1 }),
            expected: { id: 1 },
            validateError: null,
            saveError: null,
            uniqueConstraintError: null
        },
        {
            description: 'should handle candidate without education, work experience, and CV',
            candidateData: {
                name: 'John Doe',
                email: 'john.doe@example.com'
            },
            mockSave: jest.fn().mockResolvedValue({ id: 1 }),
            expected: { id: 1 },
            validateError: null,
            saveError: null,
            uniqueConstraintError: null
        }
    ])('$description', async ({ candidateData, mockSave, expected, validateError, saveError, uniqueConstraintError }) => {
        // Arrange
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            if (validateError) throw new Error(validateError);
        });

        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: []
        }));

        if (uniqueConstraintError) {
            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                throw uniqueConstraintError;
            });
        } else if (saveError) {
            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                throw new Error(saveError);
            });
        } else {
            (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
                return await callback();
            });
        }

        // Act & Assert
        if (validateError || saveError || uniqueConstraintError) {
            await expect(addCandidate(candidateData)).rejects.toThrow(expected);
        } else {
            const result = await addCandidate(candidateData);
            expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
            expect(result).toEqual(expected);
            if ('educations' in candidateData) {
                expect(Education.prototype.save).toHaveBeenCalledWith(1);
            }
            if ('workExperiences' in candidateData) {
                expect(WorkExperience.prototype.save).toHaveBeenCalled();
            }
            if ('cv' in candidateData) {
                expect(Resume.prototype.save).toHaveBeenCalled();
            }
        }
    });

    const testCases = [
        [
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                educations: [{ degree: 'MSc', institution: 'College' }],
                workExperiences: [{ company: 'Tech Corp', role: 'Engineer' }],
                cv: { fileName: 'resume.pdf', fileContent: '...' }
            },
            new Error('Simulated error')
        ],
        // Add more test cases as needed
    ];

    test.each(testCases)('should rollback transaction on error', async (candidateData, error) => {
        const mockSave = jest.fn().mockRejectedValue(error);

        (validateCandidateData as jest.Mock).mockImplementation(() => { });
        (Candidate as unknown as jest.Mock).mockImplementation(() => ({
            save: mockSave,
            education: [],
            workExperience: [],
            resumes: []
        }));

        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            try {
                await callback();
            } catch (error) {
                // Rollback logic here
                throw error; // Rethrow the error to trigger rollback
            }
        });

        // Assert that the transaction is rolled back on error
        await expect(addCandidate(candidateData)).rejects.toThrow('Simulated error');
        expect(mockSave).toHaveBeenCalled(); // Ensure save method was called
        // Add additional assertions as needed
    });
});

describe('getCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return a candidate with all associated data', async () => {
        const candidateId = 1;
        const mockCandidate = { id: candidateId, name: 'John Doe', email: 'john@example.com' };
        const mockEducations = [{ id: 1, degree: 'BSc', institution: 'University' }];
        const mockWorkExperiences = [{ id: 1, company: 'Company', role: 'Developer' }];
        const mockResumes = [{ id: 1, fileName: 'resume.pdf', fileContent: '...' }];

        (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
        (Education.findAll as jest.Mock).mockResolvedValue(mockEducations);
        (WorkExperience.findAll as jest.Mock).mockResolvedValue(mockWorkExperiences);
        (Resume.findAll as jest.Mock).mockResolvedValue(mockResumes);

        const result = await getCandidate(candidateId);

        expect(Candidate.findOne).toHaveBeenCalledWith(candidateId);
        expect(Education.findAll).toHaveBeenCalledWith(candidateId);
        expect(WorkExperience.findAll).toHaveBeenCalledWith(candidateId);
        expect(Resume.findAll).toHaveBeenCalledWith(candidateId);
        expect(result).toEqual({
            ...mockCandidate,
            education: mockEducations,
            workExperience: mockWorkExperiences,
            resumes: mockResumes
        });
    });

    test('should throw an error if candidate is not found', async () => {
        const candidateId = 999; // Non-existent ID
        (Candidate.findOne as jest.Mock).mockResolvedValue(null);

        await expect(getCandidate(candidateId)).rejects.toThrow('Candidate not found');
    });

    test('should handle errors during data fetching', async () => {
        const candidateId = 1;
        const error = new Error('Database error');
        (Candidate.findOne as jest.Mock).mockRejectedValue(error);

        await expect(getCandidate(candidateId)).rejects.toThrow('Failed to fetch candidate data: Database error');
    });
});

