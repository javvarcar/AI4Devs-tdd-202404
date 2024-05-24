import { PrismaClient } from '@prisma/client';
import { Resume } from './Resume';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

describe('Resume Model', () => {
    describe('save method', () => {
        const resumeTestCases = [
            {
                description: 'should update an existing resume',
                resumeData: { id: 1, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf' },
                mockMethod: 'update' as 'update',
                expectedResult: { id: 1, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf', uploadDate: expect.any(Date) }
            },
            {
                description: 'should create a new resume successfully',
                resumeData: { candidateId: 1, filePath: 'resume2.pdf', fileType: 'pdf' },
                mockMethod: 'create' as 'create',
                expectedResult: { id: 2, candidateId: 1, filePath: 'resume2.pdf', fileType: 'pdf', uploadDate: expect.any(Date) }
            }
        ];

        it.each(resumeTestCases)('$description', async ({ resumeData, mockMethod, expectedResult }) => {
            // Arrange
            const resume = new Resume(resumeData);
            (prisma.resume[mockMethod] as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await resume.save();

            // Assert
            expect(result).toEqual(expectedResult);
            if (mockMethod === 'update') {
                expect(prisma.resume[mockMethod]).toHaveBeenCalledWith({
                    where: { id: resumeData.id },
                    data: expect.any(Object)
                });
            } else {
                expect(prisma.resume[mockMethod]).toHaveBeenCalledWith({
                    data: expect.any(Object)
                });
            }
        });

        it('should throw an error if resume record not found on update', async () => {
            // Arrange
            const resume = new Resume({ id: 999, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf' });
            (prisma.resume.update as jest.Mock).mockRejectedValue({ message: "Record not found", code: 'P2025' });

            // Act & Assert
            await expect(resume.save()).rejects.toThrow('No se pudo encontrar el registro del resume con el ID proporcionado.');
        });

        it('should handle other errors on update', async () => {
            // Arrange
            const resume = new Resume({ id: 1, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf' });
            const error = new Error('Unexpected error');
            (prisma.resume.update as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(resume.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle database connection errors on create', async () => {
            // Arrange
            const resume = new Resume({ candidateId: 1, filePath: 'resume3.pdf', fileType: 'pdf' });
            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.resume.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(resume.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle unexpected errors on create', async () => {
            // Arrange
            const resume = new Resume({ candidateId: 1, filePath: 'resume4.pdf', fileType: 'pdf' });
            const error = new Error('Unexpected error');
            (prisma.resume.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(resume.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle different file types', async () => {
            // Arrange
            const resume = new Resume({ candidateId: 1, filePath: 'resume.docx', fileType: 'docx' });
            const expectedResult = { id: 3, candidateId: 1, filePath: 'resume.docx', fileType: 'docx', uploadDate: expect.any(Date) };
            (prisma.resume.create as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await resume.save();

            // Assert
            expect(result).toEqual(expectedResult);
            expect(prisma.resume.create).toHaveBeenCalledWith({
                data: expect.any(Object)
            });
        });

        it('should handle large file sizes', async () => {
            // Arrange
            const largeFilePath = 'large_resume.pdf';
            const resume = new Resume({ candidateId: 1, filePath: largeFilePath, fileType: 'pdf' });
            const expectedResume = { id: 4, candidateId: 1, filePath: largeFilePath, fileType: 'pdf', uploadDate: expect.any(Date) };
            (prisma.resume.create as jest.Mock).mockResolvedValue(expectedResume);

            // Act
            const result = await resume.save();

            // Assert
            expect(result).toEqual(expectedResume);
        });
    });

    describe('findOne method', () => {
        const findOneTestCases = [
            {
                description: 'should find a resume by ID',
                id: 1,
                mockResult: { id: 1, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf', uploadDate: new Date() },
                expectedResult: { id: 1, candidateId: 1, filePath: 'resume1.pdf', fileType: 'pdf', uploadDate: expect.any(Date) }
            },
            {
                description: 'should return null if resume not found',
                id: 999,
                mockResult: null,
                expectedResult: null
            }
        ];

        it.each(findOneTestCases)('$description', async ({ id, mockResult, expectedResult }) => {
            // Arrange
            (prisma.resume.findUnique as jest.Mock).mockResolvedValue(mockResult);

            // Act
            const result = await Resume.findOne(id);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(prisma.resume.findUnique).toHaveBeenCalledWith({
                where: { id }
            });
        });

        it('should handle unexpected errors', async () => {
            // Arrange
            const id = 1;
            const error = new Error('Unexpected error');
            (prisma.resume.findUnique as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(Resume.findOne(id)).rejects.toThrow('Unexpected error');
        });
    });

    it('should handle null data input', () => {
        const resume = new Resume(null);
        expect(resume.id).toBeUndefined();
        expect(resume.candidateId).toBeUndefined();
        expect(resume.filePath).toBeUndefined();
        expect(resume.fileType).toBeUndefined();
        expect(resume.uploadDate).toBeInstanceOf(Date);
    });

    it('should handle undefined data input', () => {
        const resume = new Resume(undefined);
        expect(resume.id).toBeUndefined();
        expect(resume.candidateId).toBeUndefined();
        expect(resume.filePath).toBeUndefined();
        expect(resume.fileType).toBeUndefined();
        expect(resume.uploadDate).toBeInstanceOf(Date);
    });

    it('should correctly assign all properties from data', () => {
        const data = {
            id: 1,
            candidateId: 2,
            filePath: 'path/to/file.pdf',
            fileType: 'pdf'
        };
        const resume = new Resume(data);
        expect(resume.id).toEqual(data.id);
        expect(resume.candidateId).toEqual(data.candidateId);
        expect(resume.filePath).toEqual(data.filePath);
        expect(resume.fileType).toEqual(data.fileType);
        expect(resume.uploadDate).toBeInstanceOf(Date);
    });

    it('should handle data with missing properties', () => {
        const data = {
            id: 1,
            filePath: 'path/to/file.pdf'
        };
        const resume = new Resume(data);
        expect(resume.id).toEqual(data.id);
        expect(resume.candidateId).toBeUndefined(); // Missing in data
        expect(resume.filePath).toEqual(data.filePath);
        expect(resume.fileType).toBeUndefined(); // Missing in data
        expect(resume.uploadDate).toBeInstanceOf(Date);
    });
});

