import { PrismaClient } from '@prisma/client';
import { WorkExperience } from './WorkExperience';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

describe('WorkExperience Model', () => {
    describe('save method', () => {
        it('should update an existing work experience', async () => {
            const workExperience = new WorkExperience({
                id: 1,
                company: 'Company A',
                position: 'Engineer',
                description: 'Engineering work',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 1
            });

            (prisma.workExperience.update as jest.Mock).mockResolvedValue(workExperience);

            const result = await workExperience.save();
            expect(result).toEqual(workExperience);
            expect(prisma.workExperience.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.any(Object)
            });
        });

        it('should create a new work experience', async () => {
            const workExperience = new WorkExperience({
                company: 'Company B',
                position: 'Developer',
                description: 'Development work',
                startDate: new Date('2021-01-01'),
                endDate: new Date('2023-01-01'),
                candidateId: 2
            });

            (prisma.workExperience.create as jest.Mock).mockResolvedValue({
                id: 2,
                ...workExperience
            });

            const result = await workExperience.save();
            expect(result).toEqual({
                id: 2,
                ...workExperience
            });
        });

        it('should handle errors on update', async () => {
            const workExperience = new WorkExperience({
                id: 999, // assuming this ID does not exist
                company: 'Company C',
                position: 'Manager',
                description: 'Management work',
                startDate: new Date('2019-01-01'),
                endDate: new Date('2021-01-01'),
                candidateId: 3
            });

            const error = new Error('Unexpected error');
            (prisma.workExperience.update as jest.Mock).mockRejectedValue(error);

            await expect(workExperience.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle errors on create', async () => {
            const workExperience = new WorkExperience({
                company: 'Company D',
                position: 'Analyst',
                description: 'Analysis work',
                startDate: new Date('2022-01-01'),
                endDate: new Date('2024-01-01'),
                candidateId: 4
            });

            const error = new Error('Unexpected error');
            (prisma.workExperience.create as jest.Mock).mockRejectedValue(error);

            await expect(workExperience.save()).rejects.toThrow('Unexpected error');
        });

        it('should throw an error if work experience record not found on update', async () => {
            const workExperience = new WorkExperience({
                id: 999, // assuming this ID does not exist
                company: 'Company A',
                position: 'Engineer',
                description: 'Engineering work',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 1
            });

            const error = { code: 'P2025' };
            (prisma.workExperience.update as jest.Mock).mockRejectedValue(error);

            await expect(workExperience.save()).rejects.toThrow('No se pudo encontrar el registro de la experiencia laboral con el ID proporcionado.');
        });

        it('should handle database connection errors on create', async () => {
            const workExperience = new WorkExperience({
                company: 'Company B',
                position: 'Developer',
                description: 'Development work',
                startDate: new Date('2021-01-01'),
                endDate: new Date('2023-01-01'),
                candidateId: 2
            });

            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.workExperience.create as jest.Mock).mockRejectedValue(error);

            await expect(workExperience.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle undefined endDate in constructor', () => {
            const workExperience = new WorkExperience({
                company: 'Company E',
                position: 'Manager',
                description: 'Management work',
                startDate: new Date('2020-01-01'),
                endDate: undefined,
                candidateId: 5
            });

            expect(workExperience.endDate).toBeUndefined();
        });
    });

    describe('findOne method', () => {
        it('should return null if work experience not found', async () => {
            (prisma.workExperience.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await WorkExperience.findOne(999); // assuming 999 is a non-existent ID
            expect(result).toBeNull();
        });

        it('should return a work experience instance if found', async () => {
            const workExperienceData = {
                id: 1,
                company: 'Company A',
                position: 'Engineer',
                description: 'Engineering work',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 1
            };
            (prisma.workExperience.findUnique as jest.Mock).mockResolvedValue(workExperienceData);

            const result = await WorkExperience.findOne(1);
            expect(result).toBeInstanceOf(WorkExperience);
            expect(result?.id).toEqual(1);
        });
    });
});

