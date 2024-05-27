import { PrismaClient } from '@prisma/client';
import { WorkExperience } from './WorkExperience';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

describe('WorkExperience Model', () => {
    describe('save method', () => {
        const workExperienceTestCases = [
            {
                description: 'should update an existing work experience',
                workExperienceData: { id: 1, company: 'Company A', position: 'Engineer', description: 'Engineering work', startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'), candidateId: 1 },
                mockMethod: 'update' as 'update',
                expectedResult: { id: 1, company: 'Company A', position: 'Engineer', description: 'Engineering work', startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'), candidateId: 1 }
            },
            {
                description: 'should create a new work experience',
                workExperienceData: { company: 'Company B', position: 'Developer', description: 'Development work', startDate: new Date('2021-01-01'), endDate: new Date('2023-01-01'), candidateId: 2 },
                mockMethod: 'create' as 'create',
                expectedResult: { id: 2, company: 'Company B', position: 'Developer', description: 'Development work', startDate: new Date('2021-01-01'), endDate: new Date('2023-01-01'), candidateId: 2 }
            }
        ];

        it.each(workExperienceTestCases)('$description', async ({ workExperienceData, mockMethod, expectedResult }) => {
            // Arrange
            const workExperience = new WorkExperience(workExperienceData);
            (prisma.workExperience[mockMethod] as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await workExperience.save();

            // Assert
            expect(result).toEqual(expectedResult);
            if (mockMethod === 'update') {
                expect(prisma.workExperience[mockMethod]).toHaveBeenCalledWith({
                    where: { id: workExperienceData.id },
                    data: expect.any(Object)
                });
            } else {
                expect(prisma.workExperience[mockMethod]).toHaveBeenCalledWith({
                    data: expect.any(Object)
                });
            }
        });

        it('should throw an error if work experience record not found on update', async () => {
            // Arrange
            const workExperience = new WorkExperience({ id: 999, company: 'Company A', position: 'Engineer', description: 'Engineering work', startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'), candidateId: 1 });
            const error = { code: 'P2025' };
            (prisma.workExperience.update as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(workExperience.save()).rejects.toThrow('No se pudo encontrar el registro de la experiencia laboral con el ID proporcionado.');
        });

        it('should handle errors on update', async () => {
            // Arrange
            const workExperience = new WorkExperience({ id: 999, company: 'Company C', position: 'Manager', description: 'Management work', startDate: new Date('2019-01-01'), endDate: new Date('2021-01-01'), candidateId: 3 });
            const error = new Error('Unexpected error');
            (prisma.workExperience.update as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(workExperience.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle errors on create', async () => {
            // Arrange
            const workExperience = new WorkExperience({ company: 'Company D', position: 'Analyst', description: 'Analysis work', startDate: new Date('2022-01-01'), endDate: new Date('2024-01-01'), candidateId: 4 });
            const error = new Error('Unexpected error');
            (prisma.workExperience.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(workExperience.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle database connection errors on create', async () => {
            // Arrange
            const workExperience = new WorkExperience({ company: 'Company B', position: 'Developer', description: 'Development work', startDate: new Date('2021-01-01'), endDate: new Date('2023-01-01'), candidateId: 2 });
            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.workExperience.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(workExperience.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle undefined endDate in constructor', () => {
            // Arrange & Act
            const workExperience = new WorkExperience({ company: 'Company E', position: 'Manager', description: 'Management work', startDate: new Date('2020-01-01'), endDate: undefined, candidateId: 5 });

            // Assert
            expect(workExperience.endDate).toBeUndefined();
        });
    });

    describe('findOne method', () => {
        const findOneTestCases = [
            {
                description: 'should return a work experience by ID',
                id: 1,
                mockResult: { id: 1, company: 'Company A', position: 'Engineer', description: 'Engineering work', startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'), candidateId: 1 },
                expectedResult: { id: 1, company: 'Company A', position: 'Engineer', description: 'Engineering work', startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'), candidateId: 1 }
            },
            {
                description: 'should return null if work experience not found',
                id: 999,
                mockResult: null,
                expectedResult: null
            }
        ];

        it.each(findOneTestCases)('$description', async ({ id, mockResult, expectedResult }) => {
            // Arrange
            (prisma.workExperience.findUnique as jest.Mock).mockResolvedValue(mockResult);

            // Act
            const result = await WorkExperience.findOne(id);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(prisma.workExperience.findUnique).toHaveBeenCalledWith({
                where: { id }
            });
        });

        it('should handle errors', async () => {
            // Arrange
            const id = 1;
            const error = new Error('Unexpected error');
            (prisma.workExperience.findUnique as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(WorkExperience.findOne(id)).rejects.toThrow('Unexpected error');
        });
    });
});