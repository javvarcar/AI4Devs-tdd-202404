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

    const educationTestCases: [string, number | undefined, 'create' | 'update'][] = [
        ['should create a new education record', undefined, 'create'],
        ['should update an existing education record', 1, 'update']
    ];

    it.each(educationTestCases)('%s', async (_, id, method) => {
        // Arrange
        const mockMethod = method === 'create' ? prisma.education.create : prisma.education.update;
        (mockMethod as jest.Mock).mockResolvedValue(mockEducationData);
        education.id = id;

        // Act
        const result = await education.save(mockEducationData.candidateId);

        // Assert
        const expectedData = {
            institution: mockEducationData.institution,
            title: mockEducationData.title,
            startDate: new Date(mockEducationData.startDate),
            endDate: new Date(mockEducationData.endDate),
            candidateId: mockEducationData.candidateId,
        };
        if (method === 'create') {
            expect(prisma.education.create).toHaveBeenCalledWith({ data: expectedData });
        } else {
            expect(prisma.education.update).toHaveBeenCalledWith({ where: { id: mockEducationData.id }, data: expectedData });
        }
        expect(result).toEqual(mockEducationData);
    });

    it('should handle missing endDate', async () => {
        // Arrange
        (prisma.education.create as jest.Mock).mockResolvedValue({
            ...mockEducationData,
            endDate: undefined,
        });
        education.endDate = undefined;
        education.id = undefined; // Ensure it's a new record

        // Act
        const result = await education.save(mockEducationData.candidateId);

        // Assert
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

    const missingFieldTestCases: [string, Partial<typeof mockEducationData>, keyof typeof mockEducationData][] = [
        ['should handle missing candidateId', { ...mockEducationData, candidateId: undefined }, 'candidateId'],
        ['should handle missing endDate in constructor', { ...mockEducationData, endDate: undefined }, 'endDate']
    ];

    it.each(missingFieldTestCases)('%s', (testName, data, missingField) => {
        // Act
        const educationInstance = new Education(data);

        // Assert
        expect((educationInstance as any)[missingField]).toBeUndefined();
    });
});

