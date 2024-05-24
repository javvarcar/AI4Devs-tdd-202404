import { PrismaClient } from '@prisma/client';
import { Education } from './Education';

const prisma = new PrismaClient();

describe('Education Model', () => {
    const mockEducationData = {
        id: 1,
        institution: 'Test University',
        title: 'Bachelor of Science',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        candidateId: 1,
    };

    let education: Education;

    beforeEach(() => {
        education = new Education(mockEducationData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new education record', async () => {
        (prisma.education.create as jest.Mock).mockResolvedValue(mockEducationData);

        education.id = undefined; // Ensure it's a new record
        const result = await education.save(mockEducationData.candidateId);

        expect(prisma.education.create).toHaveBeenCalledWith({
            data: {
                institution: mockEducationData.institution,
                title: mockEducationData.title,
                startDate: new Date(mockEducationData.startDate),
                endDate: new Date(mockEducationData.endDate),
                candidateId: mockEducationData.candidateId,
            },
        });
        expect(result).toEqual(mockEducationData);
    });

    it('should update an existing education record', async () => {
        (prisma.education.update as jest.Mock).mockResolvedValue(mockEducationData);

        const result = await education.save(mockEducationData.candidateId);

        expect(prisma.education.update).toHaveBeenCalledWith({
            where: { id: mockEducationData.id },
            data: {
                institution: mockEducationData.institution,
                title: mockEducationData.title,
                startDate: new Date(mockEducationData.startDate),
                endDate: new Date(mockEducationData.endDate),
                candidateId: mockEducationData.candidateId,
            },
        });
        expect(result).toEqual(mockEducationData);
    });

    it('should handle missing endDate', async () => {
        (prisma.education.create as jest.Mock).mockResolvedValue({
            ...mockEducationData,
            endDate: undefined,
        });

        education.endDate = undefined;
        education.id = undefined; // Ensure it's a new record
        const result = await education.save(mockEducationData.candidateId);

        expect(prisma.education.create).toHaveBeenCalledWith({
            data: {
                institution: mockEducationData.institution,
                title: mockEducationData.title,
                startDate: new Date(mockEducationData.startDate),
                endDate: undefined,
                candidateId: mockEducationData.candidateId,
            },
        });
        expect(result).toEqual({
            ...mockEducationData,
            endDate: undefined,
        });
    });

    it('should handle missing candidateId', () => {
        const dataWithoutCandidateId = {
            ...mockEducationData,
            candidateId: undefined,
        };

        const educationWithoutCandidateId = new Education(dataWithoutCandidateId);

        expect(educationWithoutCandidateId.candidateId).toBeUndefined();
    });

    it('should handle missing endDate in constructor', () => {
        const dataWithoutEndDate = {
            ...mockEducationData,
            endDate: undefined,
        };

        const educationWithoutEndDate = new Education(dataWithoutEndDate);

        expect(educationWithoutEndDate.endDate).toBeUndefined();
    });
});