import { PrismaClient } from '@prisma/client';
import { Education } from './Education';

const prisma = new PrismaClient();

describe('Education Model', () => {
    describe('save method', () => {
        it('should update an existing education record', async () => {
            const education = new Education({
                id: 1,
                institution: 'University X',
                title: 'Master of Science',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 1
            });

            (prisma.education.update as jest.Mock).mockResolvedValue(education);

            const result = await education.save();
            expect(result).toEqual(education);
            expect(prisma.education.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.any(Object)
            });
        });

        it('should create a new education record', async () => {
            const education = new Education({
                institution: 'University Y',
                title: 'Bachelor of Arts',
                startDate: new Date('2018-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 2
            });

            // Ensure the mock includes the 'id' field
            (prisma.education.create as jest.Mock).mockResolvedValue({
                id: 2, // Explicitly include the id in the resolved value
                institution: 'University Y',
                title: 'Bachelor of Arts',
                startDate: new Date('2018-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 2
            });

            const result = await education.save();
            expect(result).toEqual({
                id: 2,
                institution: 'University Y',
                title: 'Bachelor of Arts',
                startDate: new Date('2018-01-01'),
                endDate: new Date('2022-01-01'),
                candidateId: 2
            });
        });

        it('should handle errors on update', async () => {
            const education = new Education({
                id: 999, // assuming this ID does not exist
                institution: 'University Z',
                title: 'PhD in Physics',
                startDate: new Date('2019-01-01'),
                endDate: new Date('2023-01-01'),
                candidateId: 3
            });

            const error = new Error('Unexpected error');
            (prisma.education.update as jest.Mock).mockRejectedValue(error);

            await expect(education.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle errors on create', async () => {
            const education = new Education({
                institution: 'University Z',
                title: 'PhD in Chemistry',
                startDate: new Date('2019-01-01'),
                endDate: new Date('2023-01-01'),
                candidateId: 4
            });

            const error = new Error('Unexpected error');
            (prisma.education.create as jest.Mock).mockRejectedValue(error);

            await expect(education.save()).rejects.toThrow('Unexpected error');
        });
    });
});

