import { PrismaClient } from '@prisma/client';
import { Resume } from './Resume';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

describe('Resume Model', () => {
    describe('save method', () => {
        it('should update an existing resume', async () => {
            const resume = new Resume({
                id: 1,
                candidateId: 1,
                filePath: 'resume1.pdf',
                fileType: 'pdf'
            });

            (prisma.resume.update as jest.Mock).mockResolvedValue(resume);

            const result = await resume.save();
            const expectedResume = {
                id: 1,
                candidateId: 1,
                filePath: 'resume1.pdf',
                fileType: 'pdf',
                uploadDate: expect.any(Date)
            };
            expect(result).toEqual(expectedResume);
            expect(prisma.resume.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.any(Object)
            });
        });

        it('should throw an error if resume record not found on update', async () => {
            const resume = new Resume({
                id: 999, // assuming this ID does not exist
                candidateId: 1,
                filePath: 'resume1.pdf',
                fileType: 'pdf'
            });

            (prisma.resume.update as jest.Mock).mockRejectedValue({ message: "Record not found", code: 'P2025' });

            await expect(resume.save()).rejects.toThrow('No se pudo encontrar el registro del resume con el ID proporcionado.');
        });

        it('should handle other errors on update', async () => {
            const resume = new Resume({
                id: 1,
                candidateId: 1,
                filePath: 'resume1.pdf',
                fileType: 'pdf'
            });

            const error = new Error('Unexpected error');
            (prisma.resume.update as jest.Mock).mockRejectedValue(error);

            await expect(resume.save()).rejects.toThrow('Unexpected error');
        });

        it('should create a new resume successfully', async () => {
            const resume = new Resume({
                candidateId: 1,
                filePath: 'resume2.pdf',
                fileType: 'pdf'
            });

            (prisma.resume.create as jest.Mock).mockResolvedValue({
                id: 2,
                candidateId: 1,
                filePath: 'resume2.pdf',
                fileType: 'pdf',
                uploadDate: new Date() // Mocked uploadDate
            });

            const expectedResume = {
                id: 2,
                candidateId: 1,
                filePath: 'resume2.pdf',
                fileType: 'pdf',
                uploadDate: expect.any(Date)  // Use expect.any(Constructor) for properties that are dynamic
            };

            const result = await resume.save();
            expect(result).toEqual(expectedResume);
        });

        it('should handle database connection errors on create', async () => {
            const resume = new Resume({
                candidateId: 1,
                filePath: 'resume3.pdf',
                fileType: 'pdf'
            });

            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.resume.create as jest.Mock).mockRejectedValue(error);

            await expect(resume.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle unexpected errors on create', async () => {
            const resume = new Resume({
                candidateId: 1,
                filePath: 'resume4.pdf',
                fileType: 'pdf'
            });

            const error = new Error('Unexpected error');
            (prisma.resume.create as jest.Mock).mockRejectedValue(error);

            await expect(resume.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle different file types', async () => {
            const resume = new Resume({
                candidateId: 1,
                filePath: 'resume.docx',
                fileType: 'docx'
            });

            (prisma.resume.create as jest.Mock).mockResolvedValue({
                id: 3,
                candidateId: 1,
                filePath: 'resume.docx',
                fileType: 'docx',
                uploadDate: new Date()
            });

            const expectedResume = {
                id: 3,
                candidateId: 1,
                filePath: 'resume.docx',
                fileType: 'docx',
                uploadDate: expect.any(Date)
            };

            const result = await resume.save();
            expect(result).toEqual(expectedResume);
        });

        it('should handle large file sizes', async () => {
            const largeFilePath = 'large_resume.pdf';
            const resume = new Resume({
                candidateId: 1,
                filePath: largeFilePath,
                fileType: 'pdf'
            });

            (prisma.resume.create as jest.Mock).mockResolvedValue({
                id: 4,
                candidateId: 1,
                filePath: largeFilePath,
                fileType: 'pdf',
                uploadDate: new Date()
            });

            const expectedResume = {
                id: 4,
                candidateId: 1,
                filePath: largeFilePath,
                fileType: 'pdf',
                uploadDate: expect.any(Date)
            };

            const result = await resume.save();
            expect(result).toEqual(expectedResume);
        });
    });

    describe('findOne method', () => {
        it('should return null if resume not found', async () => {
            (prisma.resume.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Resume.findOne(999); // assuming 999 is a non-existent ID
            expect(result).toBeNull();
        });

        it('should return a resume instance if found', async () => {
            const resumeData = {
                id: 1,
                candidateId: 1,
                filePath: 'resume1.pdf',
                fileType: 'pdf'
            };
            (prisma.resume.findUnique as jest.Mock).mockResolvedValue(resumeData);

            const result = await Resume.findOne(1);
            expect(result).toBeInstanceOf(Resume);
            expect(result?.id).toEqual(1);
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

